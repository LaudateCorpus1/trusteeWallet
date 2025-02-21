/**
 * @version 0.45
 */
const INITIAL_STATE = {
    flowType: '',
    callback: false,
    timeLocked : 0
}

const lockScreenStoreReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'SET_LOCK_SCREEN_CONFIG':
            return {
                ...state,
                flowType: action.flowType,
                callback: action.callback || false,
                timeLocked : action.timeLocked || 0
            }
        default:
            break
    }

    return state
}

export default lockScreenStoreReducer
