import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SortingSessionComponent } from './session/sorting-session.component';

import { SortablejsModule } from 'angular-sortablejs';
import { WindowComponent } from './window/window.component';

import { WindowsService } from './windows.service';

@NgModule({
  declarations: [
    AppComponent,
    SortingSessionComponent,
    WindowComponent
  ],
  imports: [
    BrowserModule,
    SortablejsModule.forRoot({
      group: 'browser-editedWindows',
      animation: 300
    })
  ],
  providers: [
    WindowsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
