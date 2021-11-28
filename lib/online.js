/*!
 * online
 * Copyright(c) 2017 luojia <luojia@luojia.me>
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
		this.msg=[];
		this.msgHistory=0;
		this._timeRec=[];
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
		this.emit('change');
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
		this.emit('change');
		this.emit('remove',ws);
		return true;
	}
	broadcast(data,except=null){
		for(let w of this.socketSet){
			if(w.readyState!==1 || w===except)continue;
			w.send(data);
		}
	}
	broadcastMsg(data,except=null){
		let t=Date.now(),i=0;
		if(t===this._timeRec[0]){
			i=++this._timeRec[1];
		}else{
			this._timeRec=[t,0];
		}
		let msg={_:'msg',id:`${conv(t,10,62)}-${conv(i,10,62)}`,data:data};
		this.broadcast(JSON.stringify(msg),except);
		(this.msgHistory>0)&&this.msg.push(msg);
		if(this.msg.length>this.msgHistory)
			this.msg.ubshift();
	}
	_onlineMsg(){
		return {_:'ol',g:this.name,c:this.connectionCount.toString(32),u:this.userCount.toString(32)};
	}
	broadcastOnline(except=null){
		let data=this._onlineMsg();
		this.broadcast(JSON.stringify(data),except);
		return data;
	}
	close(){
		this.socketSet.clear();
		this.userMap.clear();
		this.msg=null;
		this.emit('close');
		this.removeAllListeners();
	}
}




class online extends EventEmitter{
	constructor(){
		super();
		this.timeout=30000;
		this.groups=new Map();
		this.subscriber=new socketGroup('subscriber');
		this.maxGroupToEnter=0;
		this.subscriberAPI=false;
	}
	handle(ws){//只处理readyState为1的连接
		if(ws.readyState>1)return;
		else if(ws.readyState===0){//如果还在建立连接的话等待连接建立并重新处理
			ws.on('open',this.handle);//等连接状态为打开时再重新进入这个过程
			return;
		}
		ws.on('message',data=>this._wsMessage(ws,data));
		ws.on('ping',data=>this._wsMessage(ws));
		ws.on('pong',data=>this._wsMessage(ws));
		ws.aliveChecker=setInterval(()=>{
			if(ws.lastActive<Date.now()-30000){
				ws.ping();
			}else if(ws.lastActive<Date.now()-40000){
				if(ws._readyState !== WebSocket.CLOSED){
					ws.close();
				}
			}
		},60000);
		ws.once('close',()=>clearInterval(ws.aliveChecker));
		ws.send('connected');
		ws.groupCount=0;
	}
	groupInfo(g,infoName){
		let group=this.groups.get(g);
		if(!group)group={u:0,c:0};
		if(infoName==undefined){
			return {u:group.userCount,c:group.connectionCount};
		}
		switch(infoName){
			case 'user':
				return group.userCount;
			case 'connection':
				return group.connectionCount;
		}
	}
	_wsMessage(ws,data){
		ws.lastActive=Date.now();
		if(!data)return;//无视空包
		try{
			var msg = JSON.parse(data);
		}catch(e){console.debug(e);return;}
		switch(msg._){
			case 'enter':{
				if(this.maxGroupToEnter>0 && this.maxGroupToEnter<=ws.groupCount)return;
				if(!msg.g || !msg.u)return;
				let G=this.groups.get(msg.g);
				if(!G){
					this.groups.set(msg.g,G=new socketGroup(msg.g));
					this.emit('new',G.name);
					G.on('change',()=>{
						this.emit('ol',G.broadcastOnline());
						if(!this.subscriberAPI)return;
						let m=G._onlineMsg();
						m._='subol';
						this.subscriber.broadcast(JSON.stringify(m));
					});
					G.on('remove',()=>this._groupRemoveEvent(G));
				}
				ws.user||(ws.user=msg.u);
				if(!G.add(ws))return;
				ws.groupCount++;
				return;
			}
			case 'leave':{
				if(!msg.g)return;
				let G=this.groups.get(msg.g);
				if(!G.remove(ws))return;
				ws.groupCount--;
				return;
			}
			case 'sub':{
				if(this.subscriberAPI !== true)return;
				subscriberAPI.call(this,ws,msg);
				return;
			}
		}
	}
	_groupRemoveEvent(G){
		if(G.socketSet.size===0){
			G.close();
			this.groups.delete(G.name);
			this.emit('remove',G.name);
		}
	}
}

function subscriberAPI(ws,msg){
	switch(msg.opt){
		case 'sub':{
			ws.user||(ws.user=msg.u);
			this.subscriber.add(ws);
			return;
		}
		case 'unsub':{
			this.subscriber.remove(ws);
			return;
		}
		case 'list':{
			let list=[...this.groups.keys()];
			ws.send(JSON.stringify({_:'list',list}));
			return;
		}
		case 'info':{
			let info=this.groupInfo(msg.g); 
			if(!info)return;
			ws.send(JSON.stringify({_:'subol',g:msg.g,c:info.c.toString(32),u:info.u.toString(32)}));
			return;
		}
	}
}

function conv(n,o,t,olist,tlist){//数,原进制,目标进制[,原数所用字符表,目标字符表]
	var dlist='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
		tnum=[],m,negative=((n+='').trim()[0]=='-'),decnum=0;
	olist||(olist=dlist);
	tlist||(tlist=dlist);
	if(negative)n=n.slice(1);
	for(var i=n.length;i--;)
		decnum+=olist.indexOf(n[i])*Math.pow(o,n.length-i-1);
	for(;decnum!=0;tnum.unshift(tlist[m])){
		m=decnum%t;
		decnum=Math.floor(decnum/t);
	}
	decnum&&tnum.unshift(tlist[decnum]);
	return (negative?'-':'')+tnum.join('');
}

module.exports={socketGroup,online};
