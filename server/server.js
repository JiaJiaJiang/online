#!/usr/bin/env node
/*
 * online
 * Copyright(c) 2017 luojia <luojia@luojia.me>
 * MIT Licensed
 */
'use strict';
const http=require('http'),
	WebSocketServer = require('ws').Server,
	online=require('../lib/online.js').online,
	request_pack=require('http_request_pack'),
	options=require('./config.js'),
	URL=require('url'),
	commander = require('commander');

commander
	.usage('[options]')
	.option('-p, --port [value]', 'port to listen')
	.option('--displayLogs', 'display logs')
	.option('--allowedHost [value]', 'json with allowed host')
	.option('--subscriberAPI', 'open subscriberAPI')
	.option('-m, --maxGroupToEnter [value]', 'maxGroupToEnter')
	.parse(process.argv);

const optList=['port','host','displayLogs','allowedHost','subscriberAPI','maxGroupToEnter'];
optList.forEach(o=>{
	if(commander[o])options[o]=commander[o];
	else if(process.env[o])options[o]=process.env[o];
});
if(typeof options.displayLogs==='string')options.displayLogs=(options.displayLogs=='true')?true:false;
if(options.allowedHost)options.allowedHost=JSON.parse(options.allowedHost);
if(typeof options.subscriberAPI==='string')options.subscriberAPI=(options.subscriberAPI=='true')?true:false;
if(options.maxGroupToEnter)options.maxGroupToEnter=Number(options.maxGroupToEnter);


//define a log function
var log=(...args)=>console.log(`[${(new Date).toLocaleString()}]`,...args);
if(options.displayLogs!=true)log=()=>{};

console.log('Settings:',options);

//http options
var httpOpt={
	port:options.port||3309,
	host:options.host||'0.0.0.0'
}

//http server
var server=http.createServer(function(req,res){
	if(ws.shouldHandle(req)){
		if(Array.isArray(options.allowedHost)){
			let url=new URL(req.headers['origin']);
			if(options.allowedHost.indexOf(url.host)>=0){
				res.wrietHead(403);
				req.end('not allowed origin');
			}
		}
		return;
	}
	queue.eat(req,res);
}).listen(options.port,httpOpt.host);
console.log(`creating online server on ${httpOpt.host}:${options.port}`);


//request queue (router)
var queue=new (request_pack.load('reqQueue'));
queue.add(function(reqClass){
	if(reqClass.req.url.startsWith('/client/')){
		var t=reqClass.url.pathname.replace(/^\/client\//,'');
		staticDir.eat(reqClass,t);
		return;
	}
	reqClass.statusCode=404;
	reqClass.end();
});


//static files
var staticDir=new (request_pack.load('staticFile')).handleDir(require('path').resolve(__dirname,'../client'));

//ws server
var ws = new WebSocketServer({server:server,path:'/online'});

//online server object
const Online=new online();
Online.maxGroupToEnter=options.maxGroupToEnter;
Online.subscriberAPI=options.subscriberAPI;
ws.on('connection',function(socket){
	Online.handle(socket);
});
Online.on('new',g=>log('[new]',g));
Online.on('remove',g=>log('[remove]',g));
Online.on('ol',d=>log('[online]',`G:${d.g} Connection:${d.c} User:${d.u}`));

//prevent exiting on exception
process.on("uncaughtException",function(e){
	log(e);
});
