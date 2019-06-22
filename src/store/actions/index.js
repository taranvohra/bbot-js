export const INIT = data => ({
  type: 'INIT',
  payload: data,
});

export const setQueryChannel = data => ({
  type: 'SET_QUERY_CHANNEL',
  payload: data,
});

export const setPugChannel = data => ({
  type: 'SET_PUG_CHANNEL',
  payload: data,
});

export const pushQueryServer = data => ({
  type: 'ADD_QUERY_SERVER',
  payload: data,
});

export const removeQueryServer = data => ({
  type: 'REMOVE_QUERY_SERVER',
  payload: data,
});

export const assignQueryServers = data => ({
  type: 'ASSIGN_QUERY_SERVERS',
  payload: data,
});

export const assignGameTypes = data => ({
  type: 'ASSIGN_GAME_TYPES',
  payload: data,
});

export const addNewPug = data => ({
  type: 'ADD_NEW_PUG',
  payload: data,
});

export const removePug = data => ({
  type: 'REMOVE_PUG',
  payload: data,
});
