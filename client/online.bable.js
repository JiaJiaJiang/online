/*!
 * online
 * Copyright(c) 2016 luojia <luojia@luojia.me>
 * MIT Licensed
 */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Online = function () {
	function Online(addr) {
		var _this = this;

		_classCallCheck(this, Online);

		this.addr = addr;
		this.groups = new Set();
		this.on = false;
		this.onOnlineChange = null;
		this.pinger = setInterval(function () {
			_this.opened && _this.ws.send('');
		}, 20000);
		if (addr) {
			this.on = true;
			this.connet();
		}
	}

	Online.prototype.enter = function enter(name) {
		if (typeof name !== 'string') throw 'name is not a string:' + name;
		this.groups.add(name);
		if (this.opened) this.ws.send(JSON.stringify({ _: 'enter', g: name }));
		return this;
	};

	Online.prototype.leave = function leave(name) {
		if (typeof name !== 'string') throw 'name is not a string:' + name;
		if (this.opened && this.groups.delete(name)) {
			this.ws.send(JSON.stringify({ _: 'leave', g: name }));
		}
		return this;
	};

	Online.prototype.leaveAll = function leaveAll() {
		if (this.opened) return;
		for (var _iterator = this.groups, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
			var _ref;

			if (_isArray) {
				if (_i >= _iterator.length) break;
				_ref = _iterator[_i++];
			} else {
				_i = _iterator.next();
				if (_i.done) break;
				_ref = _i.value;
			}

			var g = _ref;
			this.leave(g);
		}return this;
	};

	Online.prototype._report = function _report(group, ol) {
		this.onOnlineChange && this.onOnlineChange(group, ol);
	};

	Online.prototype.connet = function connet() {
		var _this2 = this;

		if (this.on === false) return;
		if (this.opened) return;
		var ws = this.ws = new WebSocket(this.addr);
		ws.onmessage = function (m) {
			if (m.data === 'connected') {
				for (var _iterator2 = _this2.groups, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
					var _ref2;

					if (_isArray2) {
						if (_i2 >= _iterator2.length) break;
						_ref2 = _iterator2[_i2++];
					} else {
						_i2 = _iterator2.next();
						if (_i2.done) break;
						_ref2 = _i2.value;
					}

					var g = _ref2;
					ws.send(JSON.stringify({ _: 'enter', g: g }));
				}return;
			}
			var msg = JSON.parse(m.data);
			switch (msg._) {
				case 'ol':
					{
						_this2._report(msg.g, msg.n || 0);
						break;
					}
			}
		};
		ws.onclose = function (e) {
			for (var _iterator3 = _this2.groups, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
				var _ref3;

				if (_isArray3) {
					if (_i3 >= _iterator3.length) break;
					_ref3 = _iterator3[_i3++];
				} else {
					_i3 = _iterator3.next();
					if (_i3.done) break;
					_ref3 = _i3.value;
				}

				var g = _ref3;
				_this2._report(g, 0);
			}setTimeout(function () {
				_this2.connet();
			}, 5000);
		};
		return this;
	};

	Online.prototype.close = function close() {
		this.on = false;
		this.ws.close();
		clearInterval(this.pinger);
	};

	_createClass(Online, [{
		key: 'opened',
		get: function get() {
			return this.ws && this.ws.readyState === 1;
		}
	}]);

	return Online;
}();