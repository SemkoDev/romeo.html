import { wasSpent, get } from '../romeo';

export const searchSpentAddress = address => ({
  type: 'SEARCH_SPENT_ADDRESS',
  payload: { address }
});

export const doneSearchSpentAddress = (address, result, error) => ({
  type: 'DONE_SEARCH_SPENT_ADDRESS',
  payload: { address, result, error }
});

export const searchSpentAddressThunk = address => (dispatch, getState) => {
  if (!address || address.length !== 90) {
    return;
  }
  const romeo = get();
  let valid = false;
  try {
    valid = romeo.iota.utils.isValidChecksum(address);
  } catch (e) {
    return;
  }
  const { spentAddress, searchSpentAddressError } = getState();
  if (!valid) {
    return;
  }
  if (address === spentAddress && !searchSpentAddressError) {
    return;
  }
  dispatch(searchSpentAddress(address));
  wasSpent(address)
    .then(spent => dispatch(doneSearchSpentAddress(address, spent)))
    .catch(() => dispatch(doneSearchSpentAddress(address, null, true)));
};

const initialState = {
  searchSpentAddress: false,
  searchSpentAddressError: false,
  spentAddress: null,
  spentAddressResult: null
};

const uiReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SEARCH_SPENT_ADDRESS':
      return Object.assign({}, state, {
        searchSpentAddress: true,
        searchSpentAddressError: false,
        spentAddress: action.payload.address
      });
    case 'DONE_SEARCH_SPENT_ADDRESS':
      if (action.payload.address !== state.spentAddress) {
        // Old request!
        return state;
      }
      return Object.assign({}, state, {
        searchSpentAddress: false,
        searchSpentAddressError: !!action.payload.error,
        spentAddressResult: action.payload.result
      });
    default:
      return state;
  }
};

export default uiReducer;
