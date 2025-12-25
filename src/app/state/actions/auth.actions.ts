import { createActionGroup, props, emptyProps } from '@ngrx/store';

export type AuthUser = { id: string; name: string };

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'setAuthUser': props<{ user: AuthUser }>(),
    'authCheckStarted': emptyProps(),
    'clearAuthUser': emptyProps(),
  },
});
