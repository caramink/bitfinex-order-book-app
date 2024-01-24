import { combineReducers, createStore } from 'redux'
import OrderBookReducer from '../reducers/order-book.reducer'



const configureStore = () => {

    const reducers = combineReducers({
        orderbook: OrderBookReducer,
    })

    const store = createStore(
        reducers,
    )

    return store
}

export default configureStore

