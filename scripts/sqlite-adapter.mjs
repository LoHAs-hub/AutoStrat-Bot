import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
export function openDatabase(path){
 const sqlite=new DatabaseSync(path);sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
 // Local migration runner; hosted schema changes are applied at publish time.
 sqlite.exec('CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)');
 if(!sqlite.prepare('SELECT name FROM local_migrations WHERE name=?').get('0000_initial')){
  sqlite.exec('BEGIN');try{sqlite.exec(readFileSync(new URL('../db/0000_initial.sql',import.meta.url),'utf8'));sqlite.prepare('INSERT INTO local_migrations VALUES (?)').run('0000_initial');sqlite.exec('COMMIT');}catch(e){sqlite.exec('ROLLBACK');throw e;}
 }
 class Prepared{
  constructor(sql,values=[]){this.sql=sql;this.values=values;}
  bind(...values){return new Prepared(this.sql,values);}
  exec(){const s=sqlite.prepare(this.sql);if(/^\s*(SELECT|PRAGMA)/i.test(this.sql))return {results:s.all(...this.values),meta:{changes:0},success:true};const r=s.run(...this.values);return {results:[],meta:{changes:Number(r.changes)},success:true};}
  async first(){return this.exec().results[0]??null;}
  async all(){return this.exec();}
  async run(){return this.exec();}
 }
 return {prepare(sql){return new Prepared(sql);},async batch(statements){sqlite.exec('BEGIN');try{const r=statements.map(s=>s.exec());sqlite.exec('COMMIT');return r;}catch(e){sqlite.exec('ROLLBACK');throw e;}},close(){sqlite.close();}};
}
