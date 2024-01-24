import { combineReducers, createStore } from 'redux'



const configureStore = () => {

    const reducers = combineReducers({

    })

    const store = createStore(
        reducers,
        {},
    )

    return store
}

export default configureStore

