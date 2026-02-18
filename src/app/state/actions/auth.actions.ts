import { createActionGroup, props, emptyProps } from '@ngrx/store';
import { AuthUser } from '../../classes/auth-user';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'setAuthUser': props<{ user: AuthUser }>(),
    'authCheckStarted': emptyProps(),
    'clearAuthUser': emptyProps(),
    'updateAuthUserRoles': props<{ roles: string[] }>(),
  },
});
