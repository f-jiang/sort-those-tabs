import {
  Component,
  EventEmitter,
  Input,
  Output,
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/core';
import { SortablejsOptions } from 'angular-sortablejs';
import { Window } from '../window';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.css'],
  animations: [
    trigger('removal', [
      state('void', style({opacity: 0})),
      state('*', style({opacity: 1})),
      transition('* => void', animate('250ms'))
    ])
  ]
})
export class WindowComponent {

  @Input() data: Window;
  @Output() onTabMoved: EventEmitter<void> = new EventEmitter<void>();
  @Output() onTabClosed: EventEmitter<number> = new EventEmitter<number>();
  @Output() onWindowClosed: EventEmitter<number> = new EventEmitter<number>();

  options: SortablejsOptions = {
    group: 'browser-editedWindows',
    animation: 300,
    onEnd: (): any => {
      this.onTabMoved.emit();
    }
  };

  onCloseTabButtonClicked(tabId: number): void {
    this.onTabClosed.emit(tabId);
  }

  onCloseWindowButtonClicked(windowId: number): void {
    this.onWindowClosed.emit(windowId);
  }

}
