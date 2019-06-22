const pugs = (state = {}, { type, payload }) => {
  switch (type) {
    case 'INIT': {
      return {
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
    default:
      return state;
  }
};

export default pugs;
