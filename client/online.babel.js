/*!
 * online
 * Copyright(c) 2016 luojia <luojia@luojia.me>
 * MIT Licensed
 */

(function () {
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  var Online =
  /*#__PURE__*/
  function () {
    function Online(addr) {
      var _this = this;

      _classCallCheck(this, Online);

      this.addr = addr;
      this.groups = new Set();
      this.on = false;
      this.waiting = false;
      this.onOnlineChange = null;
      this.onData = null;
      this.onConnected = null;
      this.pinger = setInterval(function () {
        _this.opened && _this.ws.send('');
      }, 25000);
      this.user = "".concat(conv(Date.now(), 10, 62), "-").concat(randomUser());
      this.ws = null;
      this.subscribing = false;

      if (window.localStorage) {
        //use stored user sign
        var user = localStorage.getItem('online_user');
        if (!user) localStorage.setItem('online_user', this.user); //save the user
        else {
            this.user = user;
          } //restore the user
      }

      if (addr) {
        this.on = true;
        this.connet();
      }
    }

    _createClass(Online, [{
      key: "send",
      value: function send(data) {
        this.ws.send(JSON.stringify(data));
      }
    }, {
      key: "enter",
      value: function enter(name) {
        if (typeof name !== 'string') throw 'name is not a string:' + name;
        this.groups.add(name);
        if (this.connected) this.send({
          _: 'enter',
          g: name,
          u: this.user
        });
        return this;
      }
    }, {
      key: "leave",
      value: function leave(name) {
        if (typeof name !== 'string') throw 'name is not a string:' + name;

        if (this.connected && this.groups.delete(name)) {
          this.send({
            _: 'leave',
            g: name
          });
        }

        return this;
      }
    }, {
      key: "subscribe",
      value: function subscribe(force) {
        this.subscribing = true;
        if (this.connected) this.send({
          _: 'sub',
          opt: 'sub',
          u: this.user
        });
      }
    }, {
      key: "unsubscribe",
      value: function unsubscribe() {
        this.subscribing = false;
        if (this.connected) this.send({
          _: 'sub',
          opt: 'unsub'
        });
      }
    }, {
      key: "requestList",
      value: function requestList() {
        this.send({
          _: 'sub',
          opt: 'list'
        });
      }
    }, {
      key: "leaveAll",
      value: function leaveAll() {
        if (this.connected) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = this.groups[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var g = _step.value;
              this.leave(g);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }

        return this;
      }
    }, {
      key: "_reportOl",
      value: function _reportOl(data) {
        this.onOnlineChange && this.onOnlineChange(data);
      }
    }, {
      key: "connet",
      value: function connet(addr) {
        var _this2 = this;

        this.waiting = false;
        if (addr) this.addr = addr;
        if (this.on === false) return;
        if (this.opened) return;
        var ws = this.ws = new WebSocket(this.addr);

        ws.onmessage = function (m) {
          if (m.data === 'connected') {
            ws.connected = true;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = _this2.groups[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var g = _step2.value;

                _this2.enter(g);
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                  _iterator2.return();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }

            _this2.subscribing && _this2.subscribe();
            _this2.onConnected && _this2.onConnected();
            return;
          }

          var msg = JSON.parse(m.data);

          switch (msg._) {
            case 'ol':
            case 'subol':
              {
                msg.c = parseInt(msg.c, 32);
                msg.u = parseInt(msg.u, 32);

                _this2._reportOl(msg);

                break;
              }

            default:
              {
                _this2.onData && _this2.onData(msg);
                break;
              }
          }
        };

        ws.onclose = function (e) {
          if (_this2.waiting) return;

          if (_this2.connected) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = _this2.groups[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var g = _step3.value;

                _this2._reportOl({
                  g: g,
                  c: 0,
                  u: 0
                });
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
                  _iterator3.return();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }
          }

          _this2.ws.connected = false;
          _this2.waiting = true;
          setTimeout(function () {
            _this2.connet();
          }, 5000);
        };

        ws.onerror = function (e) {
          return ws.onclose();
        };

        return this;
      }
    }, {
      key: "close",
      value: function close() {
        this.on = false;
        this.ws.close();
        clearInterval(this.pinger);
      }
    }, {
      key: "opened",
      get: function get() {
        return this.ws && this.ws.readyState === 1;
      }
    }, {
      key: "connected",
      get: function get() {
        return this.ws.connected;
      }
    }]);

    return Online;
  }();

  function randomUser() {
    return conv(Math.round(99999999 * Math.random()), 10, 62);
  } //gist: https://gist.coding.net/u/luojia/c33a7e50d9634a1d9084ebd71c468114/


  function conv(n, o, t, olist, tlist) {
    //数,原进制,目标进制[,原数所用字符表,目标字符表]
    var dlist = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        tnum = [],
        m,
        negative = (n += '').trim()[0] == '-',
        decnum = 0;
    olist || (olist = dlist);
    tlist || (tlist = dlist);
    if (negative) n = n.slice(1);

    for (var i = n.length; i--;) {
      decnum += olist.indexOf(n[i]) * Math.pow(o, n.length - i - 1);
    }

    for (; decnum != 0; tnum.unshift(tlist[m])) {
      m = decnum % t;
      decnum = Math.floor(decnum / t);
    }

    decnum && tnum.unshift(tlist[decnum]);
    return (negative ? '-' : '') + tnum.join('');
  }

  window.Online = Online;
})(); //sessionStorage
