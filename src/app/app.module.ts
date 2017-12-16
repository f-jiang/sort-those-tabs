import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SessionComponent } from './session/session.component';

import { SortablejsModule } from 'angular-sortablejs';
import { WindowComponent } from './window/window.component';

@NgModule({
  declarations: [
    AppComponent,
    SessionComponent,
    WindowComponent
  ],
  imports: [
    BrowserModule,
    SortablejsModule.forRoot({})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
