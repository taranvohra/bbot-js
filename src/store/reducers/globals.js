const globals = (state = {}, { type, payload }) => {
  
	let newState;
	switch (type) {
		case 'INIT':
			newState = {
				...state,
				[payload.serverId]: {
          prefix: null,
          cooldown: {},
					ignoreGroupCommands: new Set()
				}
			};
			break;

		case 'SET_PREFIX':
			newState = {
				...state,
				[payload.serverId]: {
					...state[payload.serverId],
					prefix: payload.prefix,
				}
			};
			break;
      
		case 'IGNORE_GROUP_COMMAND':
			if (!state[payload.serverId].ignoreGroupCommands) {
				state[payload.serverId].ignoreGroupCommands  = new Set();
			}
			
			newState = {
				...state,
				[payload.serverId]: {
					...state[payload.serverId],
					prefix: payload.prefix,
					ignoreGroupCommands: state[payload.serverId].ignoreGroupCommands.add(payload.groupCommands),
				},
			};
			break;

		case 'UNIGNORE_GROUP_COMMAND':
			const set = new Set(state[payload.serverId].ignoreGroupCommands);
			set.delete(payload.groupCommands);
			newState = {
				...state,
				[payload.serverId]: {
					...state[payload.serverId],
					ignoreGroupCommands: set,
				},
			};
			break;
      
    case 'CMD_COOLDOWN_INIT': 
      newState = {
        ...state,
        [payload.serverId]: {
          ...state[payload.serverId],
          cooldown: {
            ...state[payload.serverId].cooldown,
            [payload.command]: payload.timestamp,
          },
        },
      };
     break;
      
    default:
      newState = state;
  }
  return newState;
};

export default globals;
