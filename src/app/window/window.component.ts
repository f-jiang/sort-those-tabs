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
      state(WindowComponent.tabRemovedState, style({opacity: 0})),
      state(WindowComponent.tabActiveState, style({opacity: 1})),
      // workaround for sortable: when tabs get moved to a lower index, their animation states become void;
      // therefore only require that a closed tab's final state be WindowComponent.tabRemovedState
      transition(`* => ${WindowComponent.tabRemovedState}`, animate('250ms'))
    ])
  ]
})
export class WindowComponent implements OnInit {

  private static readonly tabRemovedState = 'removed';
  private static readonly tabActiveState = 'active';

  @Output()
  private _onTabMoved: EventEmitter<void> = new EventEmitter<void>();
  @Output()
  private _onTabRemoved: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  private _onTabsSortedByDomainName: EventEmitter<number> = new EventEmitter<number>();
  @Output()
  private _onTabsSortedByTitle: EventEmitter<number> = new EventEmitter<number>();
  @Output()
  private _onWindowRemoved: EventEmitter<number> = new EventEmitter<number>();

  private _states: string[];

  public readonly extensionFavIconUrl: string = 'assets/icon.png';
  public readonly genericWebpageIconUrl: string = 'assets/webpage.png';

  @Input()
  public data: Window;

  public options: SortablejsOptions = {
    group: 'browser-editedWindows',
    animation: 300,
    onEnd: (): any => {
      this._onTabMoved.emit();
      this.refreshStates();
    }
  };

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  private refreshStates(): void {
    this._states = new Array(this.data.tabs.length);
    this._states.fill(WindowComponent.tabActiveState);
  }

  public get windowId(): number {
    return this.data.id;
  }

  public get tabIds(): number[] {
    return this.data.tabs.map(tab => tab.id);
  }

  public ngOnInit(): void {
    this.refreshStates();
  }

  public onAnimationStateChange(event: any, tabId: number): void {
    // workaround for sortable: when tabs get moved to a lower index, their animation states become void;
    // therefore only require that a closed tab's final state be WindowComponent.tabRemovedState
    if (event.toState === WindowComponent.tabRemovedState) {
      this.refreshStates();
      this._onTabRemoved.emit(tabId);
      this.refreshStates();
    }
  }

  public removeTab(tabId: number): void {
    const tabIndex: number = this.data.tabs.findIndex(tab => tab.id === tabId);
    this._states[tabIndex] = WindowComponent.tabRemovedState;
    this.changeDetectorRef.detectChanges();
  }

  public onRemoveTabButtonClicked(tabId: number): void {
    if (this.data.tabs.length > 1) {
      this.removeTab(tabId);
    } else {
      this._onWindowRemoved.emit(this.windowId);
    }
  }

  public onSortTabsByDomainNameButtonClicked(): void {
    this._onTabsSortedByDomainName.emit(this.windowId);
  }

  public onSortTabsByTitleButtonClicked(): void {
    this._onTabsSortedByTitle.emit(this.windowId);
  }

  public onRemoveWindowButtonClicked(): void {
    this._onWindowRemoved.emit(this.windowId);
  }

}
