import test from 'node:test';
import assert from 'node:assert/strict';
import { SignalOracle, bracketAtNextOpen, resolveSyntheticBar, sessionAt } from './reference.mjs';

// All prices are invented integers. These are not TradingView or TMF historical data.
const minute = 60000, period = 5 * minute;
const start = Date.parse('2026-10-05T08:45:00+08:00');
const candle = (i, o = 100, h = 101, l = 99, c = 100, extra = {}) => ({ source: 'synthetic', confirmed: true, time: start + i * period, closeTime: start + (i + 1) * period, nominalMs: period, open: o, high: h, low: l, close: c, ...extra });
const warm = () => Array.from({ length: 20 }, (_, i) => candle(i));
const breakout = () => candle(20, 100, 104, 100, 103);
const retest = (i = 21) => candle(i, 101, 103, 101, 103);
const run = (bars, options = {}) => { const model = new SignalOracle(options); for (const b of bars) model.step(b); return model; };
const types = output => output.map(e => e.type);
const seed = options => run([...warm(), breakout()], options);

test('warmup never creates a breakout from insufficient history', () => {
  assert.deepEqual(run(warm()).events, []);
});
test('breakout excludes current high and freezes ATR/stop from known data', () => {
  const m = seed();
  assert.equal(m.episode.level, 101);
  assert.equal(m.episode.stop, 99);
  assert.equal(m.episode.vol, 30 / 14);
  const frozen = m.episode.vol;
  m.step(candle(21, 104, 110, 102, 104));
  assert.equal(m.episode.vol, frozen);
  assert.notEqual(m.atr, frozen);
});
test('direct mode confirms on breakout; retest mode waits for a later completed bar', () => {
  const direct = seed({ mode: 'Direct' }), wait = seed();
  assert.equal(direct.events.filter(e => e.type === 'signal')[0].bar, 20);
  assert.equal(wait.events.filter(e => e.type === 'signal').length, 0);
  assert.deepEqual(types(wait.step(retest())), ['signal']);
});
test('touch from above is allowed without first trading below the breakout level', () => {
  const m = seed();
  const result = m.step(retest());
  assert.equal(retest().low, m.episode.level);
  assert.equal(result[0].type, 'signal');
});
test('unconfirmed price excursions cannot mutate committed signal state', () => {
  const m = seed(), before = JSON.stringify(m);
  assert.deepEqual(m.step(candle(21, 103, 150, 50, 140, { confirmed: false })), []);
  assert.equal(JSON.stringify(m), before);
  assert.equal(m.step(retest())[0].type, 'signal');
});
test('first price confirmation that fails risk cancels instead of shopping for a later entry', () => {
  const m = seed();
  assert.equal(m.step(candle(21, 101, 110, 101, 109))[0].reason, 'signal_risk');
  assert.equal(m.step(retest(22)).filter(e => e.type === 'signal').length, 0);
});
test('close invalidation cancels; subsequent recovery does not revive the same event', () => {
  const m = seed();
  assert.equal(m.step(candle(21, 101, 102, 97, 99))[0].reason, 'close_invalidation');
  assert.equal(m.step(retest(22)).filter(e => e.type === 'signal').length, 0);
});
test('a wick through the failure threshold does not equal a close invalidation', () => {
  const m = seed();
  assert.deepEqual(m.step(candle(21, 100, 104, 95, 102)), []);
  assert.equal(m.episode.stop, 99);
  assert.equal(m.step(retest(22))[0].type, 'signal');
});
test('the final waiting bar remains eligible before timeout is applied', () => {
  const m = seed();
  for (let i = 21; i <= 25; i++) m.step(candle(i, 104, 105, 103, 104));
  assert.equal(m.step(retest(26))[0].type, 'signal');
});
test('expired events remain in common cooldown and cannot enter on a late retest', () => {
  const m = seed();
  for (let i = 21; i <= 25; i++) m.step(candle(i, 104, 105, 103, 104));
  assert.equal(m.step(candle(26, 104, 105, 103, 104))[0].type, 'expired');
  assert.equal(m.step(retest(27)).filter(e => e.type === 'signal').length, 0);
  assert.equal(m.episode.start, 20);
});
test('direct and retest use the same event cohort despite different signal times', () => {
  const bars = [...warm(), breakout(), retest()];
  for (let i = 22; i < 50; i++) bars.push(candle(i, 103, 106, 101, i % 4 === 0 ? 105 : 103));
  bars[36] = candle(36, 105, 109, 104, 108);
  const select = m => m.events.filter(e => e.type === 'episode');
  assert.ok(select(run(bars)).length >= 2);
  assert.deepEqual(select(run(bars, { mode: 'Direct' })), select(run(bars)));
});
test('holding deadline belongs to the breakout event, not the later confirmation', () => {
  const m = seed(); m.step(retest());
  let exits = [];
  for (let i = 22; i <= 33; i++) exits.push(...m.step(candle(i, 103, 104, 102, 103)).filter(e => e.type === 'time_exit'));
  assert.equal(exits.length, 1);
  assert.equal(exits[0].bar, 32);
});
test('same-session missing bars cancel waiting and disable new entries for that session', () => {
  const m = seed();
  const b = retest(24);
  assert.equal(m.step(b)[0].reason, 'data_gap');
  assert.equal(m.badSession, true);
});
test('midnight stays within one Taiwan night session; day/night boundary resets waiting', () => {
  assert.equal(sessionAt(Date.parse('2026-10-05T23:55:00+08:00')).id, sessionAt(Date.parse('2026-10-06T00:05:00+08:00')).id);
  const m = seed(), t = Date.parse('2026-10-05T15:00:00+08:00');
  assert.ok(types(m.step(candle(21, 100, 101, 99, 100, { time: t, closeTime: t + period }))).includes('session_reset'));
  assert.equal(m.episode, null);
});
test('session-end cutoff vetoes new confirmations before any next-session order', () => {
  const t = Date.parse('2026-10-05T13:00:00+08:00');
  const bars = warm().map((b, i) => ({ ...b, time: t - (20 - i) * period, closeTime: t - (19 - i) * period }));
  const m = run(bars); m.step({ ...breakout(), time: t, closeTime: t + period });
  let result;
  for (let j = 1; j <= 7; j++) {
    const bt = t + j * period;
    result = m.step(candle(20 + j, 104, 105, 103, 104, { time: bt, closeTime: bt + period }));
    if (result.some(e => e.reason === 'session_cutoff')) break;
  }
  assert.ok(result.some(e => e.reason === 'session_cutoff'));
  assert.equal(m.events.filter(e => e.type === 'expired').length, 0);
});
test('long/short signal formulas are symmetric under a price reflection', () => {
  const bars = [...warm(), breakout(), retest()];
  const mirrored = bars.map(b => ({ ...b, open: 1000 - b.open, high: 1000 - b.low, low: 1000 - b.high, close: 1000 - b.close }));
  const a = run(bars).events.filter(e => e.type === 'signal')[0], b = run(mirrored).events.filter(e => e.type === 'signal')[0];
  assert.equal(a.bar, b.bar); assert.equal(a.direction, -b.direction); assert.equal(a.stop, 1000 - b.stop);
});
test('future suffix changes cannot alter earlier emitted events', () => {
  const prefix = [...warm(), breakout(), retest()];
  const future = Array.from({ length: 30 }, (_, j) => candle(22 + j, 200 + j, 203 + j, 197 + j, 201 + j));
  const before = run(prefix).events;
  assert.deepEqual(run([...prefix, ...future]).events.filter(e => e.bar < prefix.length), before);
});
test('duplicate completed bars and undeclared real-market inputs are rejected', () => {
  const m = run([candle(0)]);
  assert.throws(() => m.step(candle(0)), /duplicate/);
  assert.throws(() => m.step({ ...candle(1), source: 'TradingView' }), /synthetic/);
});
test('entry uses the next open, including adverse slippage, rather than confirmation close', () => {
  const s = { direction: 1, stop: 48900, vol: 100, signalClose: 49000 };
  const b = bracketAtNextOpen(s, 49010);
  assert.equal(b.entry, 49013); assert.equal(b.risk, 113); assert.equal(b.target, 49239);
});
test('gap beyond stop and excessive fill risk remain filled failures, never deleted signals', () => {
  for (const open of [48890, 49200]) {
    const b = bracketAtNextOpen({ direction: 1, stop: 48900, vol: 100 }, open);
    assert.equal(b.valid, false); assert.equal(b.action, 'exit_on_next_available_tick'); assert.equal(b.entryCost, 29.8);
  }
});
test('favorable entry gaps need positive risk, not the pre-signal minimum again', () => {
  const b = bracketAtNextOpen({ direction: 1, stop: 48900, vol: 100 }, 48910, { slipTicks: 0 });
  assert.equal(b.valid, true); assert.equal(b.risk, 10);
});
test('unknown intrabar order produces distinct outcomes when stop and target both touch', () => {
  const p = bracketAtNextOpen({ direction: 1, stop: 99, vol: 3 }, 103, { slipTicks: 0 });
  const bar = candle(0, 103, 112, 98, 104);
  assert.equal(resolveSyntheticBar(p, bar, 'low-first', { slipTicks: 0 }).reason, 'stop');
  assert.equal(resolveSyntheticBar(p, bar, 'high-first', { slipTicks: 0 }).reason, 'limit');
});
test('a gap through protection is filled from the available open, not the stop price', () => {
  const p = bracketAtNextOpen({ direction: 1, stop: 99, vol: 3 }, 103, { slipTicks: 0 });
  assert.equal(resolveSyntheticBar(p, candle(0, 95, 100, 94, 97), 'low-first', { slipTicks: 0 }).exit, 95);
});
test('slippage already in fills is not deducted again; one TMF point is 10 TWD', () => {
  const p = bracketAtNextOpen({ direction: 1, stop: 48900, vol: 100 }, 49000);
  const result = resolveSyntheticBar(p, candle(0, 49000, 49010, 48800, 48900), 'low-first');
  assert.equal(result.exit, 48897);
  assert.ok(Math.abs(result.pnl - (-1060 - 59.6)) < 1e-9);
});
test('known session gaps are not falsely labeled missing same-session data', () => {
  const m = seed();
  const t = Date.parse('2026-10-05T15:00:00+08:00');
  m.step(candle(21, 100, 101, 99, 100, { time: t, closeTime: t + period }));
  assert.equal(m.badSession, false);
});
