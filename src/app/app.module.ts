import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { UrlParser } from './url/url-parser';

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
    BrowserAnimationsModule,
    SortablejsModule
  ],
  providers: [
    WindowsService,
    SortingSessionService,
    UrlParser
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
