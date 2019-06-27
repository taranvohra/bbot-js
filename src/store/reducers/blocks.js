const blocks = (state = {}, { type, payload }) => {
  switch (type) {
    // TODO INIT for hydrating blocks from DB
    case 'INIT': {
      return {
        ...state,
        [payload.serverId]: {
          list: [],
        },
      };
    }
    case 'ASSIGN_BLOCKS': {
      return {
        ...state,
        [payload.serverId]: {
          ...state[payload.serverId],
          list: payload.blockedUsers,
        },
      };
    }
    case 'ADD_BLOCK': {
      const { list = [] } = state[payload.serverId];
      return {
        ...state,
        [payload.serverId]: {
          ...state[payload.serverId],
          list: [...list, payload.blockedUser],
        },
      };
    }

    case 'REMOVE_BLOCK': {
      const { list = [] } = state[payload.serverId];
      const updatedList = list.filter(u => u.id !== payload.unblockedUserId);
      return {
        ...state,
        [payload.serverId]: {
          ...state[payload.serverId],
          list: updatedList,
        },
      };
    }
    default:
      return state;
  }
};

export default blocks;
