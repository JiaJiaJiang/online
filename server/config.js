var conf=module.exports={
	port:process.env.PORT||3309,//服务器端口
	host:process.env.HOST||'0.0.0.0',//服务器端口
	displayLogs:false,//是否在node打出log
	allowedHost:null,//(数组)允许的请求来源域,null为不限，只对ws连接有效。
	subscriberAPI:true,//开放订阅接口
	maxGroupToEnter:0,//最多可加入多少组，0为不限
}


