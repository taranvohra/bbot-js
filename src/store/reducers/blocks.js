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
    case 'ADD_BLOCK': {
      const { list = [] } = state[payload.serverId];
      return {
        ...state,
        [payload.serverId]: {
          list: [...list, payload.blockedUser],
        },
      };
    }
    case 'REMOVE_BLOCK': {
    }
    default:
      return state;
  }
};

export default blocks;
