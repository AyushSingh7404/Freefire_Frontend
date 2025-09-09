import { createReducer, on } from '@ngrx/store';
import { User } from '../../core/models/user.model';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.loginSuccess, AuthActions.registerSuccess, (state, { response }) => {
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    return {
      ...state,
      user: response.user,
      token: response.token,
      refreshToken: response.refreshToken,
      isAuthenticated: true,
      loading: false,
      error: null
    };
  }),
  on(AuthActions.loginFailure, AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(AuthActions.logout, () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return {
      ...initialState,
      token: null,
      refreshToken: null,
      isAuthenticated: false
    };
  }),
  on(AuthActions.updateUser, (state, { user }) => ({
    ...state,
    user: state.user ? { ...state.user, ...user } : null
  })),
  on(AuthActions.clearError, (state) => ({
    ...state,
    error: null
  }))
);