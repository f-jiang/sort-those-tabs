import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SortablejsOptions } from 'angular-sortablejs';
import { Window } from '../window';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.css']
})
export class WindowComponent implements OnInit {

  @Input() data: Window;
  @Output() onEdited: EventEmitter<void> = new EventEmitter<void>();

  options: SortablejsOptions = {
    group: 'browser-editedWindows',
    animation: 300,
    onEnd: (): any => {
      this.onEdited.emit();
    }
  };

  constructor() { }

  ngOnInit() {
  }

}
