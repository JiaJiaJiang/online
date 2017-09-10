var conf=module.exports={
	port:process.env.PORT||3309,//服务器端口
	displayLogs:false,//是否在node打出log
	allowedHost:null,//(数组)允许的请求来源域,null为不限，只对ws连接有效。
	subscriberAPI:false,//开放订阅接口
	maxGroupToEnter:0,//最多可加入多少组，0为不限
}

if(process.env.port!=undefined)conf.port=Number(process.env.port);
if(process.env.displayLogs!=undefined)conf.displayLogs=(process.env.displayLogs=='true')?true:false;
if(process.env.allowedHost!=undefined)conf.allowedHost=JSON.parse(process.env.allowedHost);
if(process.env.subscriberAPI!=undefined)conf.subscriberAPI=(process.env.subscriberAPI=='true')?true:false;
if(process.env.maxGroupToEnter!=undefined)conf.maxGroupToEnter=Number(process.env.maxGroupToEnter);