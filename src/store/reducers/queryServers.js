const queryServers = (state = {}, { type, payload }) => {
  switch (type) {
    case 'SET_QUERY_CHANNEL': {
      console.log(payload.serverId);
      return {
        ...state,
        [payload.serverId]: {
          ...state[payload.serverId],
          queryChannel: payload.queryChannel,
        },
      };
    }
    case 'ADD_QUERY_SERVER': {
      return;
    }
    case 'REMOVE_QUERY_SERVER': {
      return;
    }
    default:
      return state;
  }
};

export default queryServers;
