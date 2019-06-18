const queryServers = (state = {}, { type, payload }) => {
  switch (type) {
    case 'INIT': {
      return {
        [payload.serverId]: {
          queryChannel: null,
          list: [],
        },
      };
    }

    case 'SET_QUERY_CHANNEL': {
      return {
        ...state,
        [payload.serverId]: {
          ...state[payload.serverId],
          queryChannel: payload.queryChannel,
        },
      };
    }

    case 'ADD_QUERY_SERVER': {
      const { list } = state[payload.serverId];
      return {
        ...state,
        [payload.serverId]: {
          ...state[payload.serverId],
          list: [...list, payload.queryServer],
        },
      };
    }

    case 'REMOVE_QUERY_SERVER': {
      return;
    }

    case 'ASSIGN_QUERY_SERVERS': {
      return {
        ...state,
        [payload.serverId]: {
          ...state[payload.serverId],
          list: payload.list,
        },
      };
    }

    default:
      return state;
  }
};

export default queryServers;
