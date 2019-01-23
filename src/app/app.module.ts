import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FullCalendarModule } from 'ng-fullcalendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgModule } from '@angular/core';
// TODO: Change it when update to Primeng 7.x.x
// import { FullCalendarModule } from 'primeng/fullcalendar';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FullCalendarModule,
    DropdownModule,
    MultiSelectModule,
    FormsModule,
    BrowserAnimationsModule,
    ButtonModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
