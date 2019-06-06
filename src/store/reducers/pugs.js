const pugs = (state = {}, { type, payload }) => {
  switch (type) {
    case 'SET_PUG_CHANNEL': {
      console.log(payload.serverId);
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
