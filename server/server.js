#!/usr/bin/env node
/*
 * online
 * Copyright(c) 2017 luojia <luojia@luojia.me>
 * MIT Licensed
 */
'use strict';
const http=require('http'),
	express = require('express'),
	compression = require('compression'),
	WebSocketServer = require('ws').Server,
	online=require('../lib/online.js').online,
	URL=require('url').URL,
	commander = require('commander');
let options;
try{
	options=require('./config.js');
}catch(e){
	console.warn('"server/config.js" not defined, using "server/config.sample.js"');
	options=require('./config.sample.js');
}
commander
	.usage('[options]')
	.option('-p, --port [value]', 'port to listen')
	.option('--displayLogs', 'display logs')
	.option('--allowedHost [value]', 'json with allowed host')
	.option('--subscriberAPI', 'open subscriberAPI')
	.option('-m, --maxGroupToEnter [value]', 'maxGroupToEnter')
	.parse(process.argv);

const optList=['port','host','displayLogs','allowedHost','subscriberAPI','maxGroupToEnter'];
const opts = commander.opts();
optList.forEach(o=>{
	if(opts[o])options[o]=opts[o];
	else if(process.env[o])options[o]=process.env[o];
});
if(typeof options.displayLogs==='string')options.displayLogs=(options.displayLogs=='true')?true:false;
if(options.allowedHost)if(typeof options.allowedHost==='string')options.allowedHost=JSON.parse(options.allowedHost);
if(typeof options.subscriberAPI==='string')options.subscriberAPI=(options.subscriberAPI=='true')?true:false;
if(options.maxGroupToEnter)options.maxGroupToEnter=Number(options.maxGroupToEnter);


//define a log function
var log=(...args)=>console.log(`[${(new Date).toLocaleString()}]`,...args);
if(options.displayLogs!=true)log=()=>{};

console.log('Settings:',options);

//express
const app = express();
const staticRouter=express.Router();
staticRouter.get('*',express.static(__dirname+'/../client'));
app.set('x-powered-by', false);
app.use(compression());
app.use('/client/',staticRouter);//静态文件 

//http options
var httpOpt={
	port:options.port||3309,
	host:options.host||'0.0.0.0'
};
//http server
var server=http.createServer(app).listen(options.port,httpOpt.host);
console.log(`creating online server on ${httpOpt.host}:${options.port}`);
//ws server
var wserver = new WebSocketServer({server,path:'/online'});

if(Array.isArray(options.allowedHost)){//override ws server shuoldHandle method
	wserver.shouldHandle=(req)=>{
		if (this.options.path) {
			const index = req.url.indexOf('?');
			const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
			if (pathname !== this.options.path) return false;
		}
		let url=new URL(req.headers['origin']);
		if(options.allowedHost.indexOf(url.hostname)===-1){
			return false;
		}
		return true;
	}
}


//online server object
const Online=new online();
Online.maxGroupToEnter=options.maxGroupToEnter;
Online.subscriberAPI=options.subscriberAPI;
Online.on('new',g=>log('[new]',g));
Online.on('remove',g=>log('[remove]',g));
Online.on('ol',d=>log('[online]',`G:${d.g} Connection:${d.c} User:${d.u}`));

wserver.on('connection',function(socket){
	Online.handle(socket);
});

//prevent exiting on exception
process.on("uncaughtException",function(e){
	console.error(e);
});
