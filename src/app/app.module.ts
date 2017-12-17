import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SessionComponent } from './session/session.component';

import { SortablejsModule } from 'angular-sortablejs';
import { WindowComponent } from './window/window.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule, MatGridListModule } from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    SessionComponent,
    WindowComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SortablejsModule.forRoot({}),
    MatToolbarModule,
    MatGridListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
