"""Validate this research packet and exercise SQLite FTS5 retrieval.

Python 3 + jsonschema are used for this audit, not by the application.
This script never fetches sources or modifies the application database.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import sqlite3
import sys

from jsonschema import Draft202012Validator, FormatChecker

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]


def read(name):
    return json.loads((HERE / name).read_text())


def sha(text):
    return hashlib.sha256(text.encode()).hexdigest()


def terms(text):
    """Chinese bigrams and Latin terms; no per-question synonyms or answer IDs."""
    result = []
    for word in re.findall(r"[a-z][a-z0-9_!.*:-]*|[\u3400-\u9fff]+|\d+(?:\.\d+)?", text.lower()):
        if re.fullmatch(r"[\u3400-\u9fff]+", word):
            result.extend(word[i:i + 2] for i in range(len(word) - 1))
        else:
            result.append(word)
    return list(dict.fromkeys(result))


def index(units):
    db = sqlite3.connect(':memory:')
    db.execute('CREATE VIRTUAL TABLE corpus USING fts5(id UNINDEXED, content)')
    for unit in units:
        # Retrieve claims only: no hand-authored expected answers, questions or tags.
        db.execute('INSERT INTO corpus VALUES (?, ?)', (unit['id'], ' '.join(terms(unit['claim']))))
    return db


def retrieve(db, units, query, as_of=None):
    tokens = terms(query)
    if not tokens:
        return []
    condition = ' OR '.join('"' + token.replace('"', '""') + '"' for token in tokens)
    by_id = {u['id']: u for u in units}
    found = []
    for uid, score in db.execute('SELECT id, bm25(corpus) FROM corpus WHERE corpus MATCH ? ORDER BY bm25(corpus), id', (condition,)):
        unit = by_id[uid]
        if unit['status'] != 'reviewed' or unit['instrument'] not in ('TAIFEX:TMF', 'ANY:PINE'):
            continue
        # Unknown first publication is never backdated to the page update date.
        first_known = unit['available_at'] or unit['retrieved_at']
        if as_of and datetime.fromisoformat(first_known) > datetime.fromisoformat(as_of):
            continue
        found.append({'unit_id': uid, 'score': score, 'claim': unit['claim']})
        if len(found) == 3:
            break
    return found


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--raw-dir', type=Path, help='Original download cache for source/quote checks')
    parser.add_argument('--query', help='Inspect top-three retrieval; does not synthesize an answer')
    args = parser.parse_args()
    knowledge = read('knowledge.json')
    units = knowledge['units']
    with index(units) as db:
        if args.query is not None:
            print(json.dumps(retrieve(db, units, args.query), ensure_ascii=False, indent=2))
            return 0

        checks = []
        failures = []

        def check(name, success, detail):
            checks.append({'name': name, 'status': 'passed' if success else 'failed', 'detail': detail})
            if not success:
                failures.append(name)

        schema = json.loads((ROOT / 'schemas/knowledge-unit.schema.json').read_text())
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator(schema, format_checker=FormatChecker())
        errors = [f"{u['id']}: {e.message}" for u in units for e in validator.iter_errors(u)]
        check('knowledge_schema', not errors, errors or 'All ten records conform to the existing JSON Schema.')
        check('unique_units', len(units) == 10 and len({u['id'] for u in units}) == 10 and len({u['content_hash'] for u in units}) == 10,
              'Ten unique IDs and claim hashes; no exact duplicates.')
        check('claim_hashes', all(sha(u['claim']) == u['content_hash'] for u in units), 'SHA-256 of every UTF-8 claim.')

        packet = read('sources.json')
        sources = {s['id']: s for s in packet['sources']}
        evidence = {e['id']: e for e in packet['evidence']}
        annotations = knowledge['annotations']
        check('source_records', len(sources) == 5 and all(s['http_status'] == 200 and s['url'].startswith('https://') and '404.htm' not in s['url'] for s in sources.values()),
              'Five retrieved HTTPS documentation pages; soft 404 discovery pages excluded.')
        check('evidence_hashes', all(sha(e['quote']) == e['sha256'] for e in evidence.values()), 'All 18 retained excerpts have matching hashes.')
        links_ok = set(annotations) == {u['id'] for u in units}
        for u in units:
            refs = annotations.get(u['id'], {}).get('evidence_ids', [])
            links_ok = links_ok and bool(refs) and all(e in evidence and evidence[e]['source_id'] in u['source_ids'] for e in refs)
            links_ok = links_ok and set(u['source_ids']) == {evidence[e]['source_id'] for e in refs if e in evidence}
        check('unit_evidence_links', links_ok, 'Every unit resolves to its actual source and excerpt IDs.')

        if args.raw_dir:
            raw_errors = []
            for sid, source in sources.items():
                raw = args.raw_dir / (source['cache_key'] + '.html')
                txt = args.raw_dir / (source['cache_key'] + '.txt')
                if not raw.exists() or not txt.exists():
                    raw_errors.append(f'{sid}: source cache missing')
                    continue
                normalized = ' '.join(txt.read_text().split())
                if hashlib.sha256(raw.read_bytes()).hexdigest() != source['decoded_sha256'] or sha(normalized) != source['normalized_text_sha256']:
                    raw_errors.append(f'{sid}: snapshot hash mismatch')
                for item in evidence.values():
                    if item['source_id'] == sid and normalized[item['normalized_start']:item['normalized_end']] != item['quote']:
                        raw_errors.append(f"{item['id']}: quote not at captured locator")
            check('captured_source_quotes', not raw_errors, raw_errors or 'Five captured snapshots and all 18 quote spans match the actual downloads.')
        else:
            checks.append({'name': 'captured_source_quotes', 'status': 'unrun', 'detail': 'Supply --raw-dir to verify original download snapshots; retained-excerpt checks still run.'})

        questions = read('questions.json')['questions']
        answers = {a['question_id']: a for a in read('answer-review.json')['answers']}
        known_units = {u['id'] for u in units}
        qa_consistency = len(questions) == 10 and len({q['id'] for q in questions}) == 10 and set(answers) == {q['id'] for q in questions}
        rows = []
        positive_pass = 0
        answerable_count = 0
        abstentions = 0
        for q in questions:
            reviewed = answers[q['id']]
            ranked = retrieve(db, units, q['question'])
            expected = reviewed['supporting_unit_ids']
            qa_consistency = qa_consistency and all(uid in known_units for uid in expected)
            if q['answerable']:
                answerable_count += 1
                passed = bool(expected) and set(expected).issubset({r['unit_id'] for r in ranked})
                positive_pass += int(passed)
                qa_consistency = qa_consistency and reviewed['status'] == 'answered'
                outcome = 'retrieval_passed' if passed else 'retrieval_failed'
            else:
                # The answer itself is manually reviewed, not generated by this script.
                consistent = reviewed['status'] == 'abstained' and not expected and reviewed['answer'].startswith('來源不足：')
                qa_consistency = qa_consistency and consistent
                abstentions += int(consistent)
                outcome = 'manual_abstention_recorded' if consistent else 'review_inconsistent'
            rows.append({'question_id': q['id'], 'question': q['question'], 'outcome': outcome,
                         'top_three': ranked, 'expected_supporting_units': expected, 'reviewed_answer': reviewed['answer']})
        check('question_answer_integrity', qa_consistency, 'Ten reviewed answers reference existing units, or explicitly record source insufficiency.')
        check('positive_retrieval_at_3', positive_pass == answerable_count, f'{positive_pass}/{answerable_count} development questions retrieve every required unit within the top three.')
        check('historical_snapshot_filter', not retrieve(db, units, 'TMF 保證金 Pine', '2026-09-30T00:00:00+00:00'),
              'The captured 2026-10-02 versions cannot be retrieved as known on 2026-09-30.')

        result = {
            'cycle_id': 'tmf-001', 'checked_at': datetime.now(timezone.utc).isoformat(),
            'runner': {'python': sys.version.split()[0], 'sqlite': sqlite3.sqlite_version},
            'status': 'passed' if not failures else 'failed', 'checks': checks,
            'retrieval': {'algorithm': 'SQLite FTS5 BM25 over Chinese bigrams and Latin tokens in claims only; status/instrument/time filters; top three',
                          'answerable_questions': answerable_count, 'all_supports_retrieved_at_3': positive_pass,
                          'recorded_manual_abstentions': abstentions, 'questions': rows},
            'limitations': ['Questions and answers are a curated development set, not a blind holdout.',
                           'Quote presence and schema checks do not prove semantic entailment or a trading edge.',
                           'Abstentions and claim interpretations were checked by this Agent, not an independent reviewer.',
                           'No LLM answer generation, Pine compilation, live-market data or strategy backtest was tested.'],
        }
        (HERE / 'validation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
        for c in checks:
            print(c['status'].upper(), c['name'], c['detail'])
        print(f'Manually recorded insufficiency answers: {abstentions}/2; these are not automated answer-generation passes.')
        return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
