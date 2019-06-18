"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assignQueryServers = exports.pushQueryServer = exports.setPugChannel = exports.setQueryChannel = exports.INIT = void 0;

var INIT = function INIT(data) {
  return {
    type: 'INIT',
    payload: data
  };
};

exports.INIT = INIT;

var setQueryChannel = function setQueryChannel(data) {
  return {
    type: 'SET_QUERY_CHANNEL',
    payload: data
  };
};

exports.setQueryChannel = setQueryChannel;

var setPugChannel = function setPugChannel(data) {
  return {
    type: 'SET_PUG_CHANNEL',
    payload: data
  };
};

exports.setPugChannel = setPugChannel;

var pushQueryServer = function pushQueryServer(data) {
  return {
    type: 'ADD_QUERY_SERVER',
    payload: data
  };
};

exports.pushQueryServer = pushQueryServer;

var assignQueryServers = function assignQueryServers(data) {
  return {
    type: 'ASSIGN_QUERY_SERVERS',
    payload: data
  };
};

exports.assignQueryServers = assignQueryServers;
//# sourceMappingURL=index.js.map