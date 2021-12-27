import { createStore, compose } from "redux";

const initialState = {
    currentUser: null
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_USER_DATA": {
            return {
                ...state,
                currentUser: action.user
            };
        }
        default: {
            return state;
        }
    }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export default createStore(reducer, composeEnhancers());