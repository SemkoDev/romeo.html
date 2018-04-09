export const updateField = update => ({
  type: 'UPDATE_FIELD',
  payload: update
});

export const getSeason = () => dispatch =>
  fetch('https://field.carriota.com/api/v1/seasons')
    .then(response => {
      return response.json();
    })
    .then(myJson => {
      const season = myJson.find(s => s.current);
      dispatch(updateField({ season }));
    })
    .catch(() => {});

const fieldReducer = (state = null, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};

export default fieldReducer;
