import {ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideNativeDateAdapter} from '@angular/material/core';
import {CalendarModule, CalendarUtils, DateAdapter} from 'angular-calendar';
import {provideAnimations} from '@angular/platform-browser/animations';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import {provideHttpClient} from '@angular/common/http';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCardModule} from '@angular/material/card';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideHttpClient(), provideRouter(routes), provideAnimationsAsync(),provideAnimations(), provideNativeDateAdapter(),
    importProvidersFrom(CalendarModule.forRoot({provide: DateAdapter, useFactory: adapterFactory})), {provide: CalendarUtils, useClass: CalendarUtils} , CalendarModule, MatExpansionModule, MatCardModule]
};
