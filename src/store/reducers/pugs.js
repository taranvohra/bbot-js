const pugs = (state = {}, { type, payload }) => {
  switch (type) {
    case 'INIT': {
      return {
        [payload.serverId]: {
          pugChannel: null,
          list: [],
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
    default:
      return state;
  }
};

export default pugs;
