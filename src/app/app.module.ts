import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SortingSessionComponent } from './sorting-session/sorting-session.component';

import { SortablejsModule } from 'angular-sortablejs';
import { WindowComponent } from './window/window.component';

import { WindowsService } from './windows.service';
import { SortingSessionService } from './sorting-session.service';

@NgModule({
  declarations: [
    AppComponent,
    SortingSessionComponent,
    WindowComponent
  ],
  imports: [
    BrowserModule,
    SortablejsModule
  ],
  providers: [
    WindowsService,
    SortingSessionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
