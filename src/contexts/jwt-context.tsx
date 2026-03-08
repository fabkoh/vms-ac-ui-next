import { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { authLogOut } from '../api/auth-api';
import { authLogin, authGetProfile } from '../api/auth-api';
import type { ApiResponse } from '../types/api';
import type { User } from '../types/models';

interface AuthContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: User | null;
  platform: string;
  login: (email: string, password: string) => Promise<ApiResponse<any>>;
  logout: () => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
}

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

export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  platform: 'JWT',
  login: () => Promise.resolve() as any,
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
      const user = (user_res as any).response;
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
  const register = async (_email: string, _name: string, _password: string) => {
    // Not implemented for JWT auth
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
