import globals from './globals';
import { combineReducers } from 'redux';
import pugs from './pugs';
import queryServers from './queryServers';
import blocks from './blocks';

export default combineReducers({ globals, queryServers, pugs, blocks });
