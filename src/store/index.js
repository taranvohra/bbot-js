import { createStore } from 'redux';
import rootReducer from './reducers';

/*
 * THE STORE IS THE REAL TIME CACHE BOT USES
 * SHAPE OF STORE: {
 *      pugs: { byDiscordServerId: {} },
 *      blocks: { byDiscordServerId: {} },
 *      queryServers: { byDiscordServerId: {} },
 * }
 */
const store = createStore(rootReducer);

export default store;
