import { createContext, useReducer, useContext } from 'react'

const AppContext = createContext(null)
const AppDispatchContext = createContext(null)

export function AppProvider({ children }) {
  const [app, dispatch] = useReducer(appReducer, {
    authModal: false,
    taskModal: false,
    admin: null,
    tasks: {
      records: [],
      count: 0,
      pageCount: 0,
    },
    task: null,
  })

  return (
    <AppContext.Provider value={app}>
      <AppDispatchContext.Provider value={dispatch}>
        <div className="container max-w-screen-lg mx-auto py-6 space-y-6">
          {children}
        </div>
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}

export function useAppDispatch() {
  return useContext(AppDispatchContext)
}

function appReducer(state, action) {
  switch (action.type) {
    case 'setAuthModal':
      return {
        ...state,
        authModal: action.value,
      }

    case 'setAdmin':
      return {
        ...state,
        admin: action.value,
      }

    case 'setTasks':
      return {
        ...state,
        tasks: action.value,
      }

    case 'setTask':
      return {
        ...state,
        task: action.value,
      }

    case 'setTaskModal':
      return {
        ...state,
        taskModal: action.value
      }

    default:
      return state
  }
}