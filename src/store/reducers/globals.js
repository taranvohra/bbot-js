const globals = (state = {}, { type, payload }) => {
	let newState;
	switch (type) {
		case 'INIT':
			newState = {
				...state,
				[payload.serverId]: {
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
			// console.log('IGNORE_GROUP_COMMANDS Payload: ', payload);
			// console.log(state);
			// console.log(state[payload.serverId]);
			if (!state[payload.serverId]) {
				state[payload.serverId] = { };
			}
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

		default:
			newState = state;
	}

	return newState;
};

export default globals;
