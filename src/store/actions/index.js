export function initStore(data) {
  return {
    type: 'INIT',
    payload: data,
  };
}
