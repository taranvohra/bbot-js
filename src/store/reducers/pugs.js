const pugs = (state = {}, { type, payload }) => {
  switch (type) {
    case 'INIT': {
      const current =
        state[payload.serverId] && state[payload.serverId].pugChannel;
      return {
        ...state,
        [payload.serverId]: {
          pugChannel: payload.pugChannel || current,
        },
      };
    }
    default:
      return state;
  }
};

export default pugs;
