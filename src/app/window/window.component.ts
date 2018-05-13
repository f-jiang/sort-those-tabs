import {
  Component,
  EventEmitter,
  Input,
  Output,
  trigger,
  state,
  style,
  transition,
  animate,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { SortablejsOptions } from 'angular-sortablejs';
import { Window } from '../window';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.css'],
  animations: [
    trigger('removal', [
      state('removed', style({opacity: 0})),
      state('active', style({opacity: 1})),
      // workaround for sortable: when tabs get moved to a lower index, their animation states become void;
      // therefore only require that a closed tab's final state be 'removed'
      transition('* => removed', animate('250ms'))
    ])
  ]
})
export class WindowComponent implements OnInit {

  readonly extensionFavIconUrl: string = 'assets/icon.png';
  readonly genericWebpageIconUrl: string = 'assets/webpage.png';

  private states: string[];

  @Input()
  private data: Window;

  @Output() onTabMoved: EventEmitter<void> = new EventEmitter<void>();
  @Output() onTabClosed: EventEmitter<number> = new EventEmitter<number>();
  @Output() onWindowClosed: EventEmitter<number> = new EventEmitter<number>();

  options: SortablejsOptions = {
    group: 'browser-editedWindows',
    animation: 300,
    onEnd: (): any => {
      this.onTabMoved.emit();
      this.refreshStates();
    }
  };

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  private refreshStates(): void {
    this.states = new Array(this.data.tabs.length);
    this.states.fill('active');
  }

  private onAnimationStateChange(event: any, tabId: number): void {
    // workaround for sortable: when tabs get moved to a lower index, their animation states become void;
    // therefore only require that a closed tab's final state be 'removed'
    if (event.toState === 'removed') {
      this.refreshStates();
      this.onTabClosed.emit(tabId);
      this.refreshStates();
    }
  }

  ngOnInit(): void {
    this.refreshStates();
  }

  get windowId(): number {
    return this.data.id;
  }

  get tabIds(): number[] {
    return this.data.tabs.map(tab => tab.id);
  }

  closeTab(tabId: number): void {
    const tabIndex: number = this.data.tabs.findIndex(tab => tab.id === tabId);
    this.states[tabIndex] = 'removed';
    this.changeDetectorRef.detectChanges();
  }

  onCloseTabButtonClicked(tabId: number): void {
    if (this.data.tabs.length > 1) {
      this.closeTab(tabId);
    } else {
      this.onWindowClosed.emit(this.windowId);
    }
  }

  onCloseWindowButtonClicked(): void {
    this.onWindowClosed.emit(this.windowId);
  }

}
