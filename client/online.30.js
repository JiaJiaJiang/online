(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*!
 * online
 * Copyright(c) 2016 luojia <luojia@luojia.me>
 * MIT Licensed
 */
'use strict';

(function () {
  class Online {
    constructor(addr) {
      this.addr = addr;
      this.groups = new Set();
      this.on = false;
      this.waiting = false;
      this.onOnlineChange = null;
      this.onData = null;
      this.onConnected = null;
      this.pinger = setInterval(() => {
        this.opened && this.ws.send('');
      }, 25000);
      this.user = `${conv(Date.now(), 10, 62)}-${randomUser()}`;
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

    get opened() {
      return this.ws && this.ws.readyState === 1;
    }

    get connected() {
      return this.ws.connected;
    }

    send(data) {
      this.ws.send(JSON.stringify(data));
    }

    enter(name) {
      if (typeof name !== 'string') throw 'name is not a string:' + name;
      this.groups.add(name);
      if (this.connected) this.send({
        _: 'enter',
        g: name,
        u: this.user
      });
      return this;
    }

    leave(name) {
      if (typeof name !== 'string') throw 'name is not a string:' + name;

      if (this.connected && this.groups.delete(name)) {
        this.send({
          _: 'leave',
          g: name
        });
      }

      return this;
    }

    subscribe(force) {
      this.subscribing = true;
      if (this.connected) this.send({
        _: 'sub',
        opt: 'sub',
        u: this.user
      });
    }

    unsubscribe() {
      this.subscribing = false;
      if (this.connected) this.send({
        _: 'sub',
        opt: 'unsub'
      });
    }

    requestList() {
      this.send({
        _: 'sub',
        opt: 'list'
      });
    }

    leaveAll() {
      if (this.connected) for (let g of this.groups) this.leave(g);
      return this;
    }

    _reportOl(data) {
      this.onOnlineChange && this.onOnlineChange(data);
    }

    connet(addr) {
      this.waiting = false;
      if (addr) this.addr = addr;
      if (this.on === false) return;
      if (this.opened) return;
      let ws = this.ws = new WebSocket(this.addr);

      ws.onmessage = m => {
        if (m.data === 'connected') {
          ws.connected = true;

          for (let g of this.groups) this.enter(g);

          this.subscribing && this.subscribe();
          this.onConnected && this.onConnected();
          return;
        }

        let msg = JSON.parse(m.data);

        switch (msg._) {
          case 'ol':
          case 'subol':
            {
              msg.c = parseInt(msg.c, 32);
              msg.u = parseInt(msg.u, 32);

              this._reportOl(msg);

              break;
            }

          default:
            {
              this.onData && this.onData(msg);
              break;
            }
        }
      };

      ws.onclose = e => {
        if (this.waiting) return;
        if (this.connected) for (let g of this.groups) this._reportOl({
          g: g,
          c: 0,
          u: 0
        });
        this.ws.connected = false;
        this.waiting = true;
        setTimeout(() => {
          this.connet();
        }, 5000);
      };

      ws.onerror = e => ws.onclose();

      return this;
    }

    close() {
      this.on = false;
      this.ws.close();
      clearInterval(this.pinger);
    }

  }

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

    for (var i = n.length; i--;) decnum += olist.indexOf(n[i]) * Math.pow(o, n.length - i - 1);

    for (; decnum != 0; tnum.unshift(tlist[m])) {
      m = decnum % t;
      decnum = Math.floor(decnum / t);
    }

    decnum && tnum.unshift(tlist[decnum]);
    return (negative ? '-' : '') + tnum.join('');
  }

  window.Online = Online;
})(); //sessionStorage

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJvbmxpbmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7Ozs7QUFNQTs7QUFDQSxDQUFDLFlBQVU7QUFDVixRQUFNLE1BQU4sQ0FBWTtBQUNYLElBQUEsV0FBVyxDQUFDLElBQUQsRUFBTTtBQUNoQixXQUFLLElBQUwsR0FBVSxJQUFWO0FBQ0EsV0FBSyxNQUFMLEdBQVksSUFBSSxHQUFKLEVBQVo7QUFDQSxXQUFLLEVBQUwsR0FBUSxLQUFSO0FBQ0EsV0FBSyxPQUFMLEdBQWEsS0FBYjtBQUNBLFdBQUssY0FBTCxHQUFvQixJQUFwQjtBQUNBLFdBQUssTUFBTCxHQUFZLElBQVo7QUFDQSxXQUFLLFdBQUwsR0FBaUIsSUFBakI7QUFDQSxXQUFLLE1BQUwsR0FBWSxXQUFXLENBQUMsTUFBSTtBQUFDLGFBQUssTUFBTCxJQUFhLEtBQUssRUFBTCxDQUFRLElBQVIsQ0FBYSxFQUFiLENBQWI7QUFBK0IsT0FBckMsRUFBc0MsS0FBdEMsQ0FBdkI7QUFDQSxXQUFLLElBQUwsR0FBVyxHQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBTCxFQUFELEVBQVksRUFBWixFQUFlLEVBQWYsQ0FBbUIsSUFBRyxVQUFVLEVBQUcsRUFBcEQ7QUFDQSxXQUFLLEVBQUwsR0FBUSxJQUFSO0FBQ0EsV0FBSyxXQUFMLEdBQWlCLEtBQWpCOztBQUNBLFVBQUcsTUFBTSxDQUFDLFlBQVYsRUFBdUI7QUFBQztBQUN2QixZQUFJLElBQUksR0FBQyxZQUFZLENBQUMsT0FBYixDQUFxQixhQUFyQixDQUFUO0FBQ0EsWUFBRyxDQUFDLElBQUosRUFBUyxZQUFZLENBQUMsT0FBYixDQUFxQixhQUFyQixFQUFtQyxLQUFLLElBQXhDLEVBQVQsQ0FBdUQ7QUFBdkQsYUFDSTtBQUFDLGlCQUFLLElBQUwsR0FBVSxJQUFWO0FBQWdCLFdBSEMsQ0FHRDtBQUNyQjs7QUFDRCxVQUFHLElBQUgsRUFB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QUMsQ0FBQyxNQUFGLEdBQVMsQ0FBVCxHQUFXLENBQXRCLENBQTVCOztBQUNELFdBQUssTUFBTSxJQUFFLENBQWIsRUFBZSxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQUssQ0FBQyxDQUFELENBQWxCLENBQWYsRUFBc0M7QUFDckMsTUFBQSxDQUFDLEdBQUMsTUFBTSxHQUFDLENBQVQ7QUFDQSxNQUFBLE1BQU0sR0FBQyxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQU0sR0FBQyxDQUFsQixDQUFQO0FBQ0E7O0FBQ0QsSUFBQSxNQUFNLElBQUUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxLQUFLLENBQUMsTUFBRCxDQUFsQixDQUFSO0FBQ0EsV0FBTyxDQUFDLFFBQVEsR0FBQyxHQUFELEdBQUssRUFBZCxJQUFrQixJQUFJLENBQUMsSUFBTCxDQUFVLEVBQVYsQ0FBekI7QUFDQTs7QUFFRCxFQUFBLE1BQU0sQ0FBQyxNQUFQLEdBQWMsTUFBZDtBQUNBLENBbklELEksQ0FvSUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiFcclxuICogb25saW5lXHJcbiAqIENvcHlyaWdodChjKSAyMDE2IGx1b2ppYSA8bHVvamlhQGx1b2ppYS5tZT5cclxuICogTUlUIExpY2Vuc2VkXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG4oZnVuY3Rpb24oKXtcclxuXHRjbGFzcyBPbmxpbmV7XHJcblx0XHRjb25zdHJ1Y3RvcihhZGRyKXtcclxuXHRcdFx0dGhpcy5hZGRyPWFkZHI7XHJcblx0XHRcdHRoaXMuZ3JvdXBzPW5ldyBTZXQoKTtcclxuXHRcdFx0dGhpcy5vbj1mYWxzZTtcclxuXHRcdFx0dGhpcy53YWl0aW5nPWZhbHNlO1xyXG5cdFx0XHR0aGlzLm9uT25saW5lQ2hhbmdlPW51bGw7XHJcblx0XHRcdHRoaXMub25EYXRhPW51bGw7XHJcblx0XHRcdHRoaXMub25Db25uZWN0ZWQ9bnVsbDtcclxuXHRcdFx0dGhpcy5waW5nZXI9c2V0SW50ZXJ2YWwoKCk9Pnt0aGlzLm9wZW5lZCYmdGhpcy53cy5zZW5kKCcnKTt9LDI1MDAwKTtcclxuXHRcdFx0dGhpcy51c2VyPWAke2NvbnYoRGF0ZS5ub3coKSwxMCw2Mil9LSR7cmFuZG9tVXNlcigpfWA7XHJcblx0XHRcdHRoaXMud3M9bnVsbDtcclxuXHRcdFx0dGhpcy5zdWJzY3JpYmluZz1mYWxzZTtcclxuXHRcdFx0aWYod2luZG93LmxvY2FsU3RvcmFnZSl7Ly91c2Ugc3RvcmVkIHVzZXIgc2lnblxyXG5cdFx0XHRcdHZhciB1c2VyPWxvY2FsU3RvcmFnZS5nZXRJdGVtKCdvbmxpbmVfdXNlcicpO1xyXG5cdFx0XHRcdGlmKCF1c2VyKWxvY2FsU3RvcmFnZS5zZXRJdGVtKCdvbmxpbmVfdXNlcicsdGhpcy51c2VyKTsvL3NhdmUgdGhlIHVzZXJcclxuXHRcdFx0XHRlbHNle3RoaXMudXNlcj11c2VyO30vL3Jlc3RvcmUgdGhlIHVzZXJcclxuXHRcdFx0fVxyXG5cdFx0XHRpZihhZGRyKXtcclxuXHRcdFx0XHR0aGlzLm9uPXRydWU7XHJcblx0XHRcdFx0dGhpcy5jb25uZXQoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Z2V0IG9wZW5lZCgpe3JldHVybiB0aGlzLndzJiZ0aGlzLndzLnJlYWR5U3RhdGU9PT0xO31cclxuXHRcdGdldCBjb25uZWN0ZWQoKXtyZXR1cm4gdGhpcy53cy5jb25uZWN0ZWQ7fVxyXG5cdFx0c2VuZChkYXRhKXtcclxuXHRcdFx0dGhpcy53cy5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcclxuXHRcdH1cclxuXHRcdGVudGVyKG5hbWUpe1xyXG5cdFx0XHRpZih0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpdGhyb3coJ25hbWUgaXMgbm90IGEgc3RyaW5nOicrbmFtZSk7XHJcblx0XHRcdHRoaXMuZ3JvdXBzLmFkZChuYW1lKTtcclxuXHRcdFx0aWYodGhpcy5jb25uZWN0ZWQpXHJcblx0XHRcdFx0dGhpcy5zZW5kKHtfOidlbnRlcicsZzpuYW1lLHU6dGhpcy51c2VyfSk7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fVxyXG5cdFx0bGVhdmUobmFtZSl7XHJcblx0XHRcdGlmKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJyl0aHJvdygnbmFtZSBpcyBub3QgYSBzdHJpbmc6JytuYW1lKTtcclxuXHRcdFx0aWYodGhpcy5jb25uZWN0ZWQgJiYgdGhpcy5ncm91cHMuZGVsZXRlKG5hbWUpKXtcclxuXHRcdFx0XHR0aGlzLnNlbmQoe186J2xlYXZlJyxnOm5hbWV9KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH1cclxuXHRcdHN1YnNjcmliZShmb3JjZSl7XHJcblx0XHRcdHRoaXMuc3Vic2NyaWJpbmc9dHJ1ZTtcclxuXHRcdFx0aWYodGhpcy5jb25uZWN0ZWQpXHJcblx0XHRcdFx0dGhpcy5zZW5kKHtfOidzdWInLG9wdDonc3ViJyx1OnRoaXMudXNlcn0pO1xyXG5cdFx0fVxyXG5cdFx0dW5zdWJzY3JpYmUoKXtcclxuXHRcdFx0dGhpcy5zdWJzY3JpYmluZz1mYWxzZTtcclxuXHRcdFx0aWYodGhpcy5jb25uZWN0ZWQpXHJcblx0XHRcdFx0dGhpcy5zZW5kKHtfOidzdWInLG9wdDondW5zdWInfSk7XHJcblx0XHR9XHJcblx0XHRyZXF1ZXN0TGlzdCgpe1xyXG5cdFx0XHR0aGlzLnNlbmQoe186J3N1Yicsb3B0OidsaXN0J30pO1xyXG5cdFx0fVxyXG5cdFx0bGVhdmVBbGwoKXtcclxuXHRcdFx0aWYodGhpcy5jb25uZWN0ZWQpXHJcblx0XHRcdFx0Zm9yKGxldCBnIG9mIHRoaXMuZ3JvdXBzKXRoaXMubGVhdmUoZyk7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fVxyXG5cdFx0X3JlcG9ydE9sKGRhdGEpe1xyXG5cdFx0XHR0aGlzLm9uT25saW5lQ2hhbmdlJiZ0aGlzLm9uT25saW5lQ2hhbmdlKGRhdGEpO1xyXG5cdFx0fVxyXG5cdFx0Y29ubmV0KGFkZHIpe1xyXG5cdFx0XHR0aGlzLndhaXRpbmc9ZmFsc2U7XHJcblx0XHRcdGlmKGFkZHIpdGhpcy5hZGRyPWFkZHI7XHJcblx0XHRcdGlmKHRoaXMub249PT1mYWxzZSlyZXR1cm47XHJcblx0XHRcdGlmKHRoaXMub3BlbmVkKXJldHVybjtcclxuXHRcdFx0bGV0IHdzPXRoaXMud3M9bmV3IFdlYlNvY2tldCh0aGlzLmFkZHIpO1xyXG5cdFx0XHR3cy5vbm1lc3NhZ2U9bT0+e1xyXG5cdFx0XHRcdGlmKG0uZGF0YT09PSdjb25uZWN0ZWQnKXtcclxuXHRcdFx0XHRcdHdzLmNvbm5lY3RlZD10cnVlO1xyXG5cdFx0XHRcdFx0Zm9yKGxldCBnIG9mIHRoaXMuZ3JvdXBzKXRoaXMuZW50ZXIoZyk7XHJcblx0XHRcdFx0XHR0aGlzLnN1YnNjcmliaW5nJiZ0aGlzLnN1YnNjcmliZSgpO1xyXG5cdFx0XHRcdFx0dGhpcy5vbkNvbm5lY3RlZCYmdGhpcy5vbkNvbm5lY3RlZCgpO1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRsZXQgbXNnPUpTT04ucGFyc2UobS5kYXRhKTtcclxuXHRcdFx0XHRzd2l0Y2gobXNnLl8pe1xyXG5cdFx0XHRcdFx0Y2FzZSAnb2wnOmNhc2UgJ3N1Ym9sJzp7XHJcblx0XHRcdFx0XHRcdG1zZy5jPXBhcnNlSW50KG1zZy5jLDMyKTtcclxuXHRcdFx0XHRcdFx0bXNnLnU9cGFyc2VJbnQobXNnLnUsMzIpO1xyXG5cdFx0XHRcdFx0XHR0aGlzLl9yZXBvcnRPbChtc2cpO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGRlZmF1bHQ6e1xyXG5cdFx0XHRcdFx0XHR0aGlzLm9uRGF0YSYmdGhpcy5vbkRhdGEobXNnKTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHdzLm9uY2xvc2U9ZT0+e1xyXG5cdFx0XHRcdGlmKHRoaXMud2FpdGluZylyZXR1cm47XHJcblx0XHRcdFx0aWYodGhpcy5jb25uZWN0ZWQpZm9yKGxldCBnIG9mIHRoaXMuZ3JvdXBzKXRoaXMuX3JlcG9ydE9sKHtnOmcsYzowLHU6MH0pO1xyXG5cdFx0XHRcdHRoaXMud3MuY29ubmVjdGVkPWZhbHNlO1xyXG5cdFx0XHRcdHRoaXMud2FpdGluZz10cnVlO1xyXG5cdFx0XHRcdHNldFRpbWVvdXQoKCk9Pnt0aGlzLmNvbm5ldCgpfSw1MDAwKTtcclxuXHRcdFx0fVxyXG5cdFx0XHR3cy5vbmVycm9yPWU9PndzLm9uY2xvc2UoKTtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9XHJcblx0XHRjbG9zZSgpe1xyXG5cdFx0XHR0aGlzLm9uPWZhbHNlO1xyXG5cdFx0XHR0aGlzLndzLmNsb3NlKCk7XHJcblx0XHRcdGNsZWFySW50ZXJ2YWwodGhpcy5waW5nZXIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcmFuZG9tVXNlcigpe1xyXG5cdFx0cmV0dXJuIGNvbnYoTWF0aC5yb3VuZCg5OTk5OTk5OSpNYXRoLnJhbmRvbSgpKSwxMCw2Mik7XHJcblx0fVxyXG5cclxuXHQvL2dpc3Q6IGh0dHBzOi8vZ2lzdC5jb2RpbmcubmV0L3UvbHVvamlhL2MzM2E3ZTUwZDk2MzRhMWQ5MDg0ZWJkNzFjNDY4MTE0L1xyXG5cdGZ1bmN0aW9uIGNvbnYobixvLHQsb2xpc3QsdGxpc3Qpey8v5pWwLOWOn+i/m+WItiznm67moIfov5vliLZbLOWOn+aVsOaJgOeUqOWtl+espuihqCznm67moIflrZfnrKbooahdXHJcblx0XHR2YXIgZGxpc3Q9JzAxMjM0NTY3ODlhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJyxcclxuXHRcdFx0dG51bT1bXSxtLG5lZ2F0aXZlPSgobis9JycpLnRyaW0oKVswXT09Jy0nKSxkZWNudW09MDtcclxuXHRcdG9saXN0fHwob2xpc3Q9ZGxpc3QpO1xyXG5cdFx0dGxpc3R8fCh0bGlzdD1kbGlzdCk7XHJcblx0XHRpZihuZWdhdGl2ZSluPW4uc2xpY2UoMSk7XHJcblx0XHRmb3IodmFyIGk9bi5sZW5ndGg7aS0tOylcclxuXHRcdFx0ZGVjbnVtKz1vbGlzdC5pbmRleE9mKG5baV0pKk1hdGgucG93KG8sbi5sZW5ndGgtaS0xKTtcclxuXHRcdGZvcig7ZGVjbnVtIT0wO3RudW0udW5zaGlmdCh0bGlzdFttXSkpe1xyXG5cdFx0XHRtPWRlY251bSV0O1xyXG5cdFx0XHRkZWNudW09TWF0aC5mbG9vcihkZWNudW0vdCk7XHJcblx0XHR9XHJcblx0XHRkZWNudW0mJnRudW0udW5zaGlmdCh0bGlzdFtkZWNudW1dKTtcclxuXHRcdHJldHVybiAobmVnYXRpdmU/Jy0nOicnKSt0bnVtLmpvaW4oJycpO1xyXG5cdH1cclxuXHJcblx0d2luZG93Lk9ubGluZT1PbmxpbmU7XHJcbn0pKCk7XHJcbi8vc2Vzc2lvblN0b3JhZ2VcclxuIl19
