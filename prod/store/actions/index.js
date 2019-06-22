"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removePug = exports.addNewPug = exports.assignGameTypes = exports.assignQueryServers = exports.removeQueryServer = exports.pushQueryServer = exports.setPugChannel = exports.setQueryChannel = exports.INIT = void 0;

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

var removeQueryServer = function removeQueryServer(data) {
  return {
    type: 'REMOVE_QUERY_SERVER',
    payload: data
  };
};

exports.removeQueryServer = removeQueryServer;

var assignQueryServers = function assignQueryServers(data) {
  return {
    type: 'ASSIGN_QUERY_SERVERS',
    payload: data
  };
};

exports.assignQueryServers = assignQueryServers;

var assignGameTypes = function assignGameTypes(data) {
  return {
    type: 'ASSIGN_GAME_TYPES',
    payload: data
  };
};

exports.assignGameTypes = assignGameTypes;

var addNewPug = function addNewPug(data) {
  return {
    type: 'ADD_NEW_PUG',
    payload: data
  };
};

exports.addNewPug = addNewPug;

var removePug = function removePug(data) {
  return {
    type: 'REMOVE_PUG',
    payload: data
  };
};

exports.removePug = removePug;
//# sourceMappingURL=index.js.map