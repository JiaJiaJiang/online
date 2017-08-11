/*!
 * online
 * Copyright(c) 2016 luojia <luojia@luojia.me>
 * MIT Licensed
 */
'use strict';
const WebSocketServer = require('ws').Server;
const online=require('../lib/online.js').online;
const options=require('./config.js');


var log=(...args)=>console.log(`[${date()}]`,...args);
if (options.displayLogs !== true) {
	log=()=>{};
}

log('Settings:');
log(options);

var wsOpt={
	port:options.port,
}
if(options.host)wsOpt.host=options.host;
var ws = new WebSocketServer(wsOpt);

console.log("creating online server  on port " + (options.port || 3309));


function date(){
	let t=new Date();
	return `${t.getFullYear()}/${t.getMonth()+1}/${t.getDate()} ${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`;
}

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