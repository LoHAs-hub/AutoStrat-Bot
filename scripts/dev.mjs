import {createServer} from 'node:http';
import {mkdirSync,readFileSync} from 'node:fs';
import {handleApi} from '../server/api.mjs';
import {openDatabase} from './sqlite-adapter.mjs';
mkdirSync('.local',{recursive:true});
const DB=openDatabase('.local/workspace.sqlite');
const assets={'/':['../src/index.html','text/html; charset=utf-8'],'/app.js':['../src/app.js','text/javascript; charset=utf-8'],'/style.css':['../src/style.css','text/css; charset=utf-8'],'/favicon.svg':['../public/favicon.svg','image/svg+xml']};
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1:4173');
  if(url.pathname.startsWith('/api/')){
   const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>20000){res.writeHead(413);res.end('Request too large');return;}chunks.push(chunk);}
   // The local server binds only to loopback. Browser-supplied identity is overwritten.
   const headers=new Headers(req.headers);headers.set('oai-authenticated-user-id','local-owner');
   const request=new Request(url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)});
   const response=await handleApi(request,{DB});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
  }else if(assets[url.pathname]){const [path,type]=assets[url.pathname];res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(readFileSync(new URL(path,import.meta.url)));}
  else{res.writeHead(404);res.end('Not found');}
 }catch(e){console.error(e.message);res.writeHead(500);res.end('Local server error');}
});
server.listen(4173,'127.0.0.1',()=>console.log('Strategy Lab ready: http://127.0.0.1:4173 (local SQLite persistence)'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{DB.close();process.exit(0);}));
