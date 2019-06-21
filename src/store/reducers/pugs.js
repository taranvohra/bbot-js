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
    default:
      return state;
  }
};

export default pugs;
