# online

用于统计页面实时在线人数的前后端，使用node实现。
本统计基于"频道"的概念，一个页面可任意加入多个频道（比如区别统计全站在线数和页面在线数）。

## 服务端

### 部署代码

可以直接下载该仓库的zip包，或者使用git拉取代码。

### 安装依赖

在使用前请在该项目目录下执行`npm i`命令安装所需依赖

### 配置
修改`server/config.js`

见文件注释

### 启动

```javascript
node server/server.js
```
本服务端没有内置加密连接配置，如果需要使用加密连接，请使用其它支持加密连接的服务器程序转发连接，或者使用支持加密连接的CDN。

## 浏览器端

### 用例

在启动服务端之后在浏览器中打开`client/demo.html`查看。

### 使用
1. 在浏览器中引用`client/online.js`或`client/online.xx.js`，其中xx为数字，表示需要支持的浏览器范围百分比(本服务端支持client目录下的静态文件输出)。
2. 在需要统计在线人数的页面上添加代码

```javascript
//示例代码
var ol=new Online('wss://online服务器地址:端口/online');//新建Online对象
ol.enter('频道1').enter('频道2').enter('频道3');//可加入多个频道
//频道名建议使用可以独立标识页面的值，比如页面id，不建议使用页面url。
ol.onOnlineChange=function(msg){//频道内在线数量变化时
	//msg.g:产生变化的频道名称
	//msg.u:频道中在线用户数
	//msg.c:频道中存在的连接数
	//做一些事情显示以上的值
}
```
*非加密连接使用`ws://`前缀，加密连接使用`wss://`前缀*

# 类说明

# Class:client/Online

## 方法

### enter(name)

加入一个频道

* name : 频道名

此方法返回此对象，支持链式调用。
```javascript
var ol=new Online(...);
ol.enter('频道1').enter('频道2').enter('频道3');
```

### leave(name)

离开一个频道

* name : 频道名

此方法返回此对象，支持链式调用。

### leaveAll()

离开所有频道

### connet([addr])

连接服务器

* addr(可选) : 指定服务器地址，不指定则使用`addr`属性中的地址

此方法返回此对象，支持链式调用。

### close()
关闭在线对象

## 属性

* [getter]opened：(bool)返回这个在线对象是否已经打开连接

