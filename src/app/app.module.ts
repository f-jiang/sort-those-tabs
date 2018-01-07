import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SessionComponent } from './session/session.component';

import { SortablejsModule } from 'angular-sortablejs';
import { WindowComponent } from './window/window.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule, MatGridListModule, MatCardModule, MatButtonModule, MatIconModule } from '@angular/material';

import { WindowsService } from './windows.service';

@NgModule({
  declarations: [
    AppComponent,
    SessionComponent,
    WindowComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SortablejsModule.forRoot({ group: 'browser-editedWindows' }),
    MatToolbarModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  providers: [
    WindowsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
