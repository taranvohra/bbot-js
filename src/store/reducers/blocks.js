const blocks = (state = {}, { type, payload }) => {
  switch (type) {
    // TODO INIT for hydrating blocks from DB
    case 'INIT': {
      return {
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
