const globals = (state = {}, { type, payload }) => {
	let newState;
	switch (type) {
		case 'SET_PREFIX':
			newState = {
				...state,
				[payload.serverId]: {
					...state[payload.serverId],
					prefix: payload.prefix,
				},
			};
			break;

		default:
			newState = state;
	}

	return newState;
};

export default globals;
