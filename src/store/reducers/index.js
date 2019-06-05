import { combineReducers } from 'redux';
import queryServers from './queryServers';
import pugs from './pugs';

export default combineReducers({ queryServers, pugs });
