export const updateRomeo = (romeo) => ({
  type: 'UPDATE_ROMEO',
  payload: romeo.asJson()
});

export const terminateRomeo = () => ({
  type: 'TERMINATE_ROMEO',
  payload: null
});

const romeoReducer = (state = null , action) => {
  switch (action.type) {
    case 'UPDATE_ROMEO':
      return action.payload;
    case 'TERMINATE_ROMEO':
      return null;
    default:
      return state
  }
};

export default romeoReducer;
