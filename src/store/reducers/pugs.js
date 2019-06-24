const pugs = (state = {}, { type, payload }) => {
  switch (type) {
    case 'INIT': {
      return {
        ...state,
        [payload.serverId]: {
          pugChannel: null,
          list: [],
          gameTypes: [],
        },
      };
    }
    case 'SET_PUG_CHANNEL': {
      return {
        ...state,
        [payload.serverId]: {
          ...state[payload.serverId],
          pugChannel: payload.pugChannel,
          list: [],
          gameTypes: [],
        },
      };
    }

    case 'ASSIGN_GAME_TYPES': {
      return {
        ...state,
        [payload.serverId]: {
          ...state[payload.serverId],
          gameTypes: payload.gameTypes,
        },
      };
    }

    case 'ADD_NEW_PUG': {
      return {
        ...state,
        [payload.serverId]: {
          ...state[payload.serverId],
          list: [...state[payload.serverId].list, payload.newPug],
        },
      };
    }

    case 'REMOVE_PUG': {
      const updatedList = state[payload.serverId].list.filter(
        p => p.name !== payload.name
      );
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

export default pugs;
