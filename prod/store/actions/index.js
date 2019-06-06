"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setPugChannel = exports.setQueryChannel = void 0;

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
//# sourceMappingURL=index.js.map