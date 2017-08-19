/*!
 * online
 * Copyright(c) 2017 luojia <luojia@luojia.me>
 * MIT Licensed
 */
'use strict';
const http=require('http');
const WebSocketServer = require('ws').Server;
const online=require('../lib/online.js').online;
const request_pack=require('http_request_pack');
const options=require('./config.js');


var log=(...args)=>console.log(`[${(new Date).toLocaleString()}]`,...args);
if (options.displayLogs !== true) {
	log=()=>{};
}

log('Settings:',options);

var httpOpt={
	port:options.port||3309,
	host:options.host||'0.0.0.0'
}

var server=http.createServer(function(req,res){
	if(ws.shouldHandle(req))return;
	queue.eat(req,res);
}).listen(options.port,httpOpt.host);

var queue=new request_pack.reqQueue();
queue.add(function(reqClass){
	if(reqClass.req.url.startsWith('/client/')){
		var t=reqClass.url.pathname.replace(/^\/client\//,'');
		staticDir.eat(reqClass,t);
		return;
	}
});


var staticDir=new request_pack.staticFile.handleDir(require('path').resolve('../client'));


var ws = new WebSocketServer({server:server,path:'/online'});
console.log("creating online server  on port " + (options.port || 3309));
const Online=new online();

ws.on('connection',function(socket){
	Online.handle(socket);
});

Online.on('new',g=>log('[new]',g));
Online.on('remove',g=>log('[remove]',g));
Online.on('ol',d=>log('[online]',`G:${d.g} Connection:${d.c} User:${d.u}`));

process.on("uncaughtException",function(e){
	log(e);
});