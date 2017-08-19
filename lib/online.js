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
		this.userMap=new Map();
	}
	get connectionCount(){
		return this.socketSet.size;
	}
	get userCount(){
		return this.userMap.size;
	}
	add(ws){
		if(ws instanceof WebSocket === false)
			throw(new TypeError('not a websocket instance'));
		if(!ws.user)return;
		if(this.socketSet.has(ws))return false;
		this.socketSet.add(ws);
		let user=this.userMap.get(ws.user);
		this.userMap.set(ws.user,(user||0)+1);
		ws.once('close',()=>this.remove(ws));
		this.emit('add',ws);
		return true;
	}
	remove(ws){
		if(!this.socketSet.has(ws))return false;
		this.socketSet.delete(ws);
		let user=this.userMap.get(ws.user);
		if(user<=1){
			this.userMap.delete(ws.user);
		}else{
			this.userMap.set(ws.user,user-1);
		}
		this.emit('remove',ws);
		return true;
	}
	broadcast(data,except=null){
		for(let w of this.socketSet){
			if(w.readyState!==1 || w===except)continue;
			w.send(data);
		}
	}
	broadcastOnline(except=null){
		let data={_:'ol',g:this.name,c:this.connectionCount.toString(32),u:this.userCount.toString(32)};
		this.broadcast(JSON.stringify(data),except);
		return data;
	}
	close(){
		this.socketSet.clear();
		this.userMap.clear();
		this.emit('close');
	}
}




class online extends EventEmitter{
	constructor(){
		super();
		this.timeout=30000;
		this.groups=new Map();
		this.handle=this.handle.bind(this);
		//this._wsMessage=this._wsMessage.bind(this);
		//this._groupRemoveEvent=this._groupRemoveEvent.bind(this);
	}
	handle(ws){//只处理readyState为1的连接
		if(ws.readyState>1)return;
		else if(ws.readyState===0){//如果还在建立连接的话等待连接建立并重新处理
			ws.on('open',this.handle);//等连接状态为打开时再重新进入这个过程
			return;
		}
		ws._socket.setTimeout(this.timeout);
		ws.on('message',data=>this._wsMessage(ws,data));
		ws.send('connected');
	}
	_wsMessage(ws,data){
		if(!data)return;//无视空包
		try{
			var msg = JSON.parse(data);
		}catch(e){return;}
		switch(msg._){
			case 'enter':{
				if(!msg.g || !msg.u)return;
				let G=this.groups.get(msg.g);
				if(!G){
					this.groups.set(msg.g,G=new socketGroup(msg.g));
					this.emit('new',G.name);
					G.on('remove',()=>this._groupRemoveEvent(G));
				}
				ws.user||(ws.user=msg.u);
				if(!G.add(ws))return;
				this.emit('ol',G.broadcastOnline());
				break;
			}
			case 'leave':{
				if(!msg.g)return;
				let G=this.groups.get(msg.g);
				if(!G.remove(ws))return;
				if(G.connectionCount){
					this.emit('ol',G.broadcastOnline());
				}
				break;
			}
		}
	}
	_groupRemoveEvent(G){
		if(G.socketSet.size===0){
			G.close();
			this.groups.delete(G.name);
			this.emit('remove',G.name);
		}else{
			G.emit('ol',G.broadcastOnline());
		}
	}
}

Object.assign(exports,{socketGroup,online});
