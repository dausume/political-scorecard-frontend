import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

// Http/Https -> How we reach out to backend
import { provideHttpClient } from '@angular/common/http';

// NgRx
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
// Imports our defined reducers to put into NgRx so all stores are available.
import { rootReducers } from './state/app.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),

    // NgRx (base)
    provideStore(rootReducers),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),

    provideHttpClient(),
  ],
};
