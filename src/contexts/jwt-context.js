import { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { authApi, authLogOut } from '../api/auth-api';
import { authLogin, authGetProfile } from '../api/auth-api';

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null
};

const handlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user } = action.payload;

    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user
    };
  },
  LOGIN: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user
    };
  },
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null
  }),
  REGISTER: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user
    };
  }
};

const reducer = (state, action) => (handlers[action.type]
  ? handlers[action.type](state, action)
  : state);

export const AuthContext = createContext({
  ...initialState,
  platform: 'JWT',
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve()
});

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = window.localStorage.getItem('accessToken');

        if (accessToken) {
          const res = (await authGetProfile());
          const user = res["response"];
          if (res.type === "success"){
          dispatch({
            type: 'INITIALIZE',
            payload: {
              ...state,
              isAuthenticated: true,
              user
            }
          });
        }else{
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: false,
              user: null
            }
          });
        }}
         else {
          dispatch({
            type: 'INITIALIZE',
            payload: {
              ...state,
              isAuthenticated: false,
              user: null
            }
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null
          }
        });
      }
    };
    initialize();
  }, []);

  const login = async (email, password) => {
    // perform login
    const res = await authLogin( {email, password });
    // if successfull
    if(res.type === "success"){
      // get user profile
      const user_res = await authGetProfile();
      const user = user_res.response;
      dispatch({
        type: 'LOGIN',
        payload:  {
          ...state,
          isAuthenticated: true,
          user
        }
      });
    }
    return res
  };

  const logout = async () => {
    await authLogOut();
    dispatch({ type: 'LOGOUT' });
  };

  // for creating new acc
  const register = async (email, name, password) => {
    const accessToken = await authApi.register({ email, name, password });
    const user = await authApi.me(accessToken);

    localStorage.setItem('accessToken', accessToken);

    dispatch({
      type: 'REGISTER',
      payload: {
        user
      }
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        platform: 'JWT',
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const AuthConsumer = AuthContext.Consumer;
