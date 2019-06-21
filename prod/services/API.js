"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _dgram = _interopRequireDefault(require("dgram"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var API =
/*#__PURE__*/
function () {
  function API() {
    _classCallCheck(this, API);
  }

  _createClass(API, null, [{
    key: "queryUT99Server",
    value: function queryUT99Server(host, port) {
      return new Promise(function (resolve, reject) {
        try {
          var status = '';

          var socket = _dgram["default"].createSocket('udp4');

          var datagram = '\\status\\XServerQuery';
          socket.send(datagram, port, host, function (err) {
            if (err) reject(err);
          });
          socket.on('message', function (message) {
            var unicodeValues = message.toJSON().data;
            var unicodeString = String.fromCharCode.apply(String, _toConsumableArray(unicodeValues));
            console.log(unicodeString);
            status += unicodeString;

            if (unicodeString.split('\\').some(function (s) {
              return s === 'final';
            })) {
              resolve(status);
              return socket.close();
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    }
  }]);

  return API;
}();

exports["default"] = API;
//# sourceMappingURL=API.js.map