/*!
 * online
 * Copyright(c) 2016 luojia <luojia@luojia.me>
 * MIT Licensed
 */
'use strict';

const WebSocket = require('ws');
const EventEmitter = require('events');

class socketGroup extends EventEmitter{
	constructor(name=null){
		super();
		this.name=name;
		this.socketSet=new Set();
	}
	get size(){
		return this.socketSet.size;
	}
	add(ws){
		if(ws instanceof WebSocket === false){
			throw(new TypeError('not a websocket instance'));
		}
		if(this.socketSet.has(ws))return false;
		this.socketSet.add(ws);
		ws.once('close',()=>this.remove(ws));
		this.emit('add',ws);
		return true;
	}
	remove(ws){
		if(!this.socketSet.has(ws))return false;
		this.socketSet.delete(ws);
		this.emit('remove',ws);
		return true;
	}
	broadcast(data,except=null){
		for(let w of this.socketSet){
			if(w.readyState!==1 || w===except)continue;
			w.send(data);
		}
	}
	close(){
		this.socketSet.clear();
		this.emit('close');
	}
}




class online extends EventEmitter{
	constructor(){
		super();
		this.groups=new Map();
		this.timeout=30000;
	}
	handle(ws){//只处理readyState为1的连接
		if(ws.readyState>1)return;
		else if(ws.readyState===0){//如果还在建立连接的话等待连接建立并重新处理
			ws.on('open',()=>this.handle(ws));
			return;
		}
		ws._socket.setTimeout(this.timeout);
		ws.on('message',data=>{
			if(!data)return;//无视空包
			try{
				var msg = JSON.parse(data);
			}catch(e){return;}
			switch(msg._){
				case 'enter':{
					if(!msg.g)return;
					let G=this.groups.get(msg.g);
					if(!G){
						this.groups.set(msg.g,G=new socketGroup(msg.g));
						this.emit('new',G.name);
						G.on('remove',()=>{
							if(G.socketSet.size===0){
								G.close();
								this.groups.delete(G.name);
								this.emit('remove',G.name);
							}else{
								G.broadcast(JSON.stringify({_:'ol',g:G.name,n:G.size}));
								this.emit('ol',G.name,G.size);
							}
						});
					}
					if(!G.add(ws))return;
					G.broadcast(JSON.stringify({_:'ol',g:G.name,n:G.size}));
					this.emit('ol',G.name,G.size);
					break;
				}
				case 'leave':{
					if(!msg.g)return;
					let G=this.groups.get(msg.g);
					if(!G.remove(ws))return;
					if(G.size){
						G.broadcast(JSON.stringify({_:'ol',g:G.name,n:G.size}));
						this.emit('ol',G.name,G.size);
					}
					break;
				}
			}
		});
		ws.send('connected');
	}
}

Object.assign(exports,{socketGroup,online});
