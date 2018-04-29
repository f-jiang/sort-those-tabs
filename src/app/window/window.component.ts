import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SortablejsOptions } from 'angular-sortablejs';
import { Window } from '../window';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.css']
})
export class WindowComponent {

  @Input() data: Window;
  @Output() onTabMoved: EventEmitter<void> = new EventEmitter<void>();

  options: SortablejsOptions = {
    group: 'browser-editedWindows',
    animation: 300,
    onEnd: (): any => {
      this.onTabMoved.emit();
    }
  };

}
