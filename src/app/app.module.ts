import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SessionComponent } from './session/session.component';

import { WindowComponent } from './window/window.component';

import { WindowsService } from './windows.service';

@NgModule({
  declarations: [
    AppComponent,
    SessionComponent,
    WindowComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    WindowsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
