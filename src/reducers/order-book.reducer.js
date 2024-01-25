import { UPDATE_BOOK } from '../constants/constants';

const initialState = {
  bids: {},
  asks: {},
  psnap: {},
  mcnt: 0,
};

function OrderBookReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_BOOK:
      return { ...action.payload };
    default:
      return state;
  }
}

export default OrderBookReducer;