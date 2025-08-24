import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BATTLE_PROVIDERS, WORLD_PROVIDERS } from './providers';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    ...BATTLE_PROVIDERS,
    ...WORLD_PROVIDERS,
  ],
};
