const globals = (state = {}, { type, payload }) => {
  let newState;
  switch (type) {
    case 'INIT': {
      return {
        ...state,
        [payload.serverId]: {
          prefix: null,
          cooldown: {},
        },
      };
    }
    case 'SET_PREFIX':
      newState = {
        ...state,
        [payload.serverId]: {
          ...state[payload.serverId],
          prefix: payload.prefix,
        },
      };
      break;
    case 'CMD_COOLDOWN_INIT': {
      return {
        ...state,
        [payload.serverId]: {
          ...state[payload.serverId],
          cooldown: {
            ...state[payload.serverId].cooldown,
            [payload.command]: payload.timestamp,
          },
        },
      };
    }
    default:
      newState = state;
  }

  return newState;
};

export default globals;
