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

var ws = new WebSocketServer({
	port: options.port
	host: options.host||'0.0.0.0'
});

console.log("creating online server  on port " + (options.port || 3309));


function date(){
	let t=new Date();
	return `${t.getFullYear()}/${t.getMonth()+1}/${t.getDate()} ${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`;
}

const Online=new online();

ws.on('connection',
function(socket) {
	Online.handle(socket);
});

Online.on('new',g=>log('[new]',g,`[${Online.groups.size} group(s)]`));
Online.on('remove',g=>log('[remove]',g,`[${Online.groups.size} group(s)]`));
Online.on('ol',(g,n)=>log('[online]',`(${n}) ${g}`));

process.on("uncaughtException",function(e){
	log(e);
});