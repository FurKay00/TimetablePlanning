import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {NativeDateAdapter, provideNativeDateAdapter} from '@angular/material/core';
import {CalendarModule, DateAdapter} from 'angular-calendar';
import {provideAnimations} from '@angular/platform-browser/animations';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimationsAsync(),provideAnimations(), provideNativeDateAdapter(),
    importProvidersFrom(CalendarModule.forRoot({
              provide: DateAdapter,
              useFactory:adapterFactory,
    })), NativeDateAdapter, ]
};
