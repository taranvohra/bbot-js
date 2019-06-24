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
    default:
      return state;
  }
};

export default blocks;
