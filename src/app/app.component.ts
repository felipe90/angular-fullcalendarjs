import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  Renderer,
  ViewChild
  } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
  } from '@angular/forms';
import { FullCalendar } from 'primeng/fullcalendar';

const DAYS_OPTIONS: any[] = [
  { label: 'EveryDay', value: [0, 1, 2, 3, 4, 5, 6] },
  { label: 'Weekdays', value: [1, 2, 3, 4, 5] },
  { label: 'Weekends', value: [0, 6] },
  { label: 'Sunday', value: [0] },
  { label: 'Monday', value: [1] },
  { label: 'Tuesday', value: [2] },
  { label: 'Wendesday', value: [3] },
  { label: 'Thursday', value: [4] },
  { label: 'Friday', value: [5] },
  { label: 'Saturday', value: [6] },
];

const TIME_OPTIONS: any[] = [
  { label: '8:00 am', value: { hours: 8, min: 0 } },
  { label: '8:30 am', value: { hours: 8, min: 30 } },
  { label: '9:00 am', value: { hours: 9, min: 0 } },
  { label: '9:30 am', value: { hours: 9, min: 30 } },
  { label: '10:00 am', value: { hours: 10, min: 0 } },
  { label: '10:30 am', value: { hours: 10, min: 30 } },
  { label: '11:00 am', value: { hours: 11, min: 0 } },
  { label: '11:30 am', value: { hours: 11, min: 30 } },
  { label: '12:00 am', value: { hours: 12, min: 0 } },
  { label: '12:30 am', value: { hours: 12, min: 30 } },
  { label: '1:00 pm', value: { hours: 13, min: 0 } },
  { label: '1:30 pm', value: { hours: 13, min: 30 } },
  { label: '2:00 pm', value: { hours: 14, min: 0 } },
  { label: '2:30 pm', value: { hours: 14, min: 30 } },
  { label: '3:00 pm', value: { hours: 15, min: 0 } },
  { label: '3:30 pm', value: { hours: 15, min: 30 } },
  { label: '4:00 pm', value: { hours: 16, min: 0 } },
  { label: '4:30 pm', value: { hours: 16, min: 30 } },
  { label: '5:00 pm', value: { hours: 17, min: 0 } },
  { label: '5:30 pm', value: { hours: 17, min: 30 } },
  { label: '6:00 pm', value: { hours: 18, min: 0 } },
];

class SchedulerForm {
  days: FormControl;
  startTime: FormControl;
  endTime: FormControl;

  constructor() {
    this.days = new FormControl('', [Validators.required]);
    this.startTime = new FormControl('', [Validators.required]);
    this.endTime = new FormControl('', [Validators.required]);
  }
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, AfterViewInit {

  @Input() serviceDetailId: number = null;
  @ViewChild('calendar') calendarRef: FullCalendar;

  public daysDialogOptions: any[] = DAYS_OPTIONS;
  public timeDialogOptions: any[] = TIME_OPTIONS;

  public form: FormGroup;
  public selectedDays = {};
  public events: any[];
  public options: any;

  private _dayTimeForm: SchedulerForm = new SchedulerForm();

  constructor(
    private _formBuilder: FormBuilder
  ) {
    this.events = [];

    this.options = {
      minTime: '00:00:00',
      maxTime: '24:00:00',
      allDaySlot: false,
      defaultView: 'agendaWeek',
      header: false,
      selectable: true,
      slotEventOverlap: false,
      eventOverlap: false,
      editable: true,
      showCurrentDate: false,
      columnHeaderFormat: {
        weekday: 'long',
      },
      nowIndicator: false,
      select: (res: any) => {
        const startDate = new Date(res.start);
        const endDate = new Date(res.end);

        this._addNewDayEventsByDrag(startDate, endDate);
        this._setDaysSelected(startDate, endDate);

        console.log(this.getRangesArray());
      }
    };
  }

  ngOnInit(): void {
    this.form = this._formBuilder.group(this._dayTimeForm);
  }

  ngAfterViewInit(): void {
    // console.log(this.calendarRef.getCalendar());
  }

  public addNewDayEventsByForm(): void {
    const selectedDaysOptions = this.form.get('days').value;
    const selectedStartTime = this.form.get('startTime').value;
    const selectedEndTime = this.form.get('endTime').value;

    const daysArray: any[] = selectedDaysOptions.reduce((acc, curr) => [...acc, ...curr]).sort();

    daysArray.forEach((day: number) => {
      const startTime = new Date();
      const endTime = new Date();

      // Set time to fix into date time schema
      startTime.setDate(this._getEquivalentSchedulerDate(startTime, day));
      endTime.setDate(this._getEquivalentSchedulerDate(endTime, day));

      startTime.setHours(selectedStartTime.value.hours);
      startTime.setMinutes(selectedStartTime.value.min);
      endTime.setHours(selectedEndTime.value.hours);
      endTime.setMinutes(selectedEndTime.value.min);

      // Update Scheduler and control fields
      this._addNewEvent(startTime, endTime);
      this.selectedDays[day] = true;
    });
    this.form.reset();
  }

  public getRangesArray(): any {

    const scheduler: any = Object.assign({}, this.selectedDays);
    Object.keys(scheduler).forEach((key) => {
      scheduler[key] = [];
    });

    const rangesArray = this.events.map((event: any) => {
      return { lovDayOfWeekID: event.start.getDay(), lowValue: event.start, highValue: event.end };
    });

    // TODO. fix it to BE Model
    rangesArray.forEach((item) => {
      scheduler[item.lovDayOfWeekID].push({
        lowValue: `${item.lowValue.getHours()}${item.lowValue.getMinutes()}`,
        highValue: `${item.highValue.getHours()}${item.highValue.getMinutes()}`,
      });
    });

    return scheduler;
  }

  private _addNewEvent(start: Date, end: Date): void {
    this.events = [...this.events, {
      'title': '',
      'start': start,
      'end': end
    }];
  }

  private _addNewDayEventsByDrag(startDragDate: Date, endDragDate: Date): void {
    const distanceBetween = ((startDragDate.getDay() - endDragDate.getDay()) * -1);

    if (distanceBetween === 0) {
      // Same days selected
      this._addNewEvent(startDragDate, endDragDate);
    } else {
      // Different days selected

      let day = new Date(startDragDate);
      let dayTopTime = new Date(startDragDate);
      dayTopTime.setHours(23);
      dayTopTime.setMinutes(59);
      this._addNewEvent(startDragDate, dayTopTime);

      for (let i = 1; i < distanceBetween; i++) {

        const start = new Date(startDragDate);
        start.setDate(day.getDate() + i);
        const end = new Date(start);

        start.setHours(0);
        start.setMinutes(0);
        end.setHours(23);
        end.setMinutes(59);

        this._addNewEvent(start, end);
      }

      day = new Date(endDragDate);
      dayTopTime = new Date(endDragDate);
      day.setHours(0);
      day.setMinutes(0);
      this._addNewEvent(day, dayTopTime);
    }
  }

  private _getEquivalentSchedulerDate(dateRef: Date, day: number): any {
    const currentDay = dateRef.getDay();
    const distance = (day) - currentDay;
    return new Date().getDate() + distance;
  }

  private _setDaysSelected(startDate: Date, endDate: Date): void {
    if ((startDate.getDay() >= 0 && startDate.getDay() <= 6) && (endDate.getDay() >= 0 && endDate.getDay() <= 6)) {
      for (let index = startDate.getDay(); index <= endDate.getDay(); index++) {
        this.selectedDays[index] = true;
      }
    }
  }
}
