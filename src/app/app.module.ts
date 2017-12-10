import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { SortablejsModule } from 'angular-sortablejs';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SortablejsModule.forRoot({})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
