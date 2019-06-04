const queryServers = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_QUERY_SERVER': {
      return;
    }
    case 'DELETE_QUERY_SERVER': {
      return;
    }
    default:
      return state;
  }
};

export default queryServers;
