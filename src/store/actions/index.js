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

export const assignQueryServers = data => ({
  type: 'ASSIGN_QUERY_SERVERS',
  payload: data,
});
