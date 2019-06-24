const queryServers = (state = {}, { type, payload }) => {
  switch (type) {
    case 'INIT': {
      return {
        ...state,
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
          list: [],
        },
      };
    }

    case 'ADD_QUERY_SERVER': {
      const { list = [] } = state[payload.serverId];
      return {
        ...state,
        [payload.serverId]: {
          ...state[payload.serverId],
          list: [...list, payload.queryServer],
        },
      };
    }

    case 'REMOVE_QUERY_SERVER': {
      const { list = [] } = state[payload.serverId];
      const sortedList = list.sort((a, b) => a.timestamp - b.timestamp);
      const updatedList = sortedList.filter((_, i) => i !== payload.index);
      return {
        ...state,
        [payload.serverId]: {
          ...state[payload.serverId],
          list: updatedList,
        },
      };
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
