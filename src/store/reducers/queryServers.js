const queryServers = (state = {}, { type, payload }) => {
  switch (type) {
    case 'INIT': {
      const current =
        state[payload.serverId] && state[payload.serverId].queryChannel;
      return {
        ...state,
        [payload.serverId]: {
          queryChannel: payload.queryChannel || current,
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
