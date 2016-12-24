/*!
 * online
 * Copyright(c) 2016 luojia <luojia@luojia.me>
 * MIT Licensed
 */
'use strict';
class Online{
	constructor(addr){
		this.addr=addr;
		this.groups=new Set();
		this.on=false;
		this.onOnlineChange=null;
		this.pinger=setInterval(()=>{this.opened&&this.ws.send('');},20000);
		if(addr){
			this.on=true;
			this.connet();
		}
	}
	get opened(){return this.ws&&this.ws.readyState===1;}
	enter(name){
		if(typeof name !== 'string')throw('name is not a string:'+name);
		this.groups.add(name);
		if(this.opened)
			this.ws.send(JSON.stringify({_:'enter',g:name}));
		return this;
	}
	leave(name){
		if(typeof name !== 'string')throw('name is not a string:'+name);
		if(this.opened && this.groups.delete(name)){
			this.ws.send(JSON.stringify({_:'leave',g:name}));
		}
		return this;
	}
	leaveAll(){
		if(this.opened)return;
		for(let g of this.groups)this.leave(g);
			return this;
	}
	_report(group,ol){
		this.onOnlineChange&&this.onOnlineChange(group,ol);
	}
	connet(){
		if(this.on===false)return;
		if(this.opened)return;
		let ws=this.ws=new WebSocket(this.addr);
		ws.onmessage=m=>{
			if(m.data==='connected'){
				for(let g of this.groups)ws.send(JSON.stringify({_:'enter',g}));
				return;
			}
			let msg=JSON.parse(m.data);
			switch(msg._){
				case 'ol':{
					this._report(msg.g,msg.n||0);
					break;
				}
			}
		}
		ws.onclose=e=>{
			for(let g of this.groups)this._report(g,0);
			setTimeout(()=>{this.connet()},5000);
		}
		return this;
	}
	close(){
		this.on=false;
		this.ws.close();
		clearInterval(this.pinger);
	}
}
