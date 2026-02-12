import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

// Http/Https -> How we reach out to backend
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

// NgRx
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
// Imports our defined reducers to put into NgRx so all stores are available.
import { rootReducers } from './state/app.state';
import { TermsEffects } from './state/effects/terms.effects';
import { WorldviewBallotEffects } from './state/effects/worldview-ballot.effects';
import { ElectionsEffects } from './state/effects/elections.effects';
import { DebateEffects } from './state/effects/debate.effects';
import { LegislationEffects } from './state/effects/legislation.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),

    // NgRx (base)
    provideStore(rootReducers),
    provideEffects([TermsEffects, WorldviewBallotEffects, ElectionsEffects, DebateEffects, LegislationEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),

    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
  ],
};
