/*!
 * online
 * Copyright(c) 2016 luojia <luojia@luojia.me>
 * MIT Licensed
 */
'use strict';
(function(){
	class Online{
		constructor(addr){
			this.addr=addr;
			this.groups=new Set();
			this.on=false;
			this.onOnlineChange=null;
			this.pinger=setInterval(()=>{this.opened&&this.ws.send('');},20000);
			this.user=`${Date.now().toString(32)}-${randomUser()}`;
			if(window.sessionStorage){//use stored user sign
				var user=sessionStorage.getItem('online_user');
				if(!user)sessionStorage.setItem('online_user',this.user);//save the user
				else{this.user=user;}//restore the user
			}
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
				this.ws.send(JSON.stringify({_:'enter',g:name,u:this.user}));
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
			if(this.opened)
				for(let g of this.groups)this.leave(g);
			return this;
		}
		_report(data){
			this.onOnlineChange&&this.onOnlineChange(group,ol);
		}
		connet(addr){
			if(addr)this.addr=addr;
			if(this.on===false)return;
			if(this.opened)return;
			let ws=this.ws=new WebSocket(this.addr);
			ws.onmessage=m=>{
				if(m.data==='connected'){
					for(let g of this.groups)this.enter(g);
					return;
				}
				let msg=JSON.parse(m.data);
				switch(msg._){
					case 'ol':{
						msg.c=parseInt(msg.c,32);
						msg.u=parseInt(msg.u,32);
						this._report(msg);
						break;
					}
				}
			}
			ws.onclose=e=>{
				for(let g of this.groups)this._report({g:g,c:0,u:0});
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

	function randomUser(){
		return ((999999999999999*Math.random())|0).toString(32);
	}
})();
//sessionStorage