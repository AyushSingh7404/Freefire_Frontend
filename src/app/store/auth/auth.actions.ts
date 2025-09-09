import { createAction, props } from '@ngrx/store';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../../core/models/user.model';

// Login actions
export const login = createAction(
  '[Auth] Login',
  props<{ credentials: LoginRequest }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ response: AuthResponse }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Register actions
export const register = createAction(
  '[Auth] Register',
  props<{ userData: RegisterRequest }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ response: AuthResponse }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// Other auth actions
export const logout = createAction('[Auth] Logout');

export const loadUser = createAction('[Auth] Load User');

export const updateUser = createAction(
  '[Auth] Update User',
  props<{ user: Partial<User> }>()
);

export const clearError = createAction('[Auth] Clear Error');