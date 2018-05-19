import {
  ChangeDetectorRef,
  Component,
  OnInit,
  AfterViewInit,
  trigger,
  state,
  style,
  transition,
  animate,
  QueryList,
  ViewChildren
} from '@angular/core';

import { SortingSessionService } from '../sorting-session.service';
import { Window } from '../window';
import { WindowComponent } from '../window/window.component';
import { getExtensionTabId } from '../utils';

// TODO: states: array or map, and update function calls accordingly
// TODO: remove unneeded calls to ChangeDetectorRef.detectChanges()
@Component({
  selector: 'app-sorting-session',
  templateUrl: './sorting-session.component.html',
  styleUrls: ['./sorting-session.component.css'],
  animations: [
    trigger('removal', [
      state(SortingSessionComponent.windowRemovedState, style({opacity: 0})),
      state(SortingSessionComponent.windowActiveState, style({opacity: 1})),
      transition(
        `${SortingSessionComponent.windowActiveState} => ${SortingSessionComponent.windowRemovedState}`,
        animate('250ms')
      )
    ])
  ]
})
export class SortingSessionComponent implements OnInit, AfterViewInit {

  private static readonly windowRemovedState: string = 'removed';
  private static readonly windowActiveState: string = 'active';

  @ViewChildren(WindowComponent)
  private _windows: QueryList<WindowComponent>;

  private _states: string[];

  constructor(private _sortingSessionService: SortingSessionService,
              private _changeDetectorRef: ChangeDetectorRef) { }

  private refreshStates(): void {
    this._states = new Array(this._sortingSessionService.data.length);
    this._states.fill(SortingSessionComponent.windowActiveState);
  }

  private addEmptyWindow(): void {
    this._sortingSessionService.addWindow(new Window());
    this.refreshStates();
  }

  public async ngOnInit(): Promise<void> {
    await this._sortingSessionService.init();
    this.addEmptyWindow();
    this.refreshStates();

    this._sortingSessionService.externalDataChange$.subscribe(() => {
      this._changeDetectorRef.detectChanges();
      this.addEmptyWindow();
    });
  }

  public ngAfterViewInit(): void {
    this._windows.changes.subscribe(() => { });
  }

  public async onAnimationStateChange(event: any, windowId: number): Promise<void> {
    if (event.fromState === SortingSessionComponent.windowActiveState &&
        event.toState === SortingSessionComponent.windowRemovedState) {
      await this._sortingSessionService.removeWindow(windowId);
      this.refreshStates();
      this._changeDetectorRef.detectChanges();
    }
  }

  public onTabMoved(): void {
    const windows: Window[] = this._sortingSessionService.data;

    // remove any empty windows except for the last one
    for (let i = 0; i < windows.length - 1; ) {
      if (windows[i].tabs.length === 0) {
        windows.splice(i, 1);
      } else {
        i++;
      }
    }

    // if a tab was added to the last, empty window, then add a new empty window
    if (windows[windows.length - 1].tabs.length !== 0) {
      this.addEmptyWindow();
    }

    // refresh the component
    this._changeDetectorRef.detectChanges();
  }

  public onTabRemoved(tabId: number): void {
    this._sortingSessionService.removeTab(tabId);
    this._changeDetectorRef.detectChanges();
  }

  public async onWindowRemoved(windowId: number): Promise<void> {
    const windowToClose: WindowComponent = this._windows.find(windowComponent => windowComponent.windowId === windowId);
    const extensionTabId: number = await getExtensionTabId();

    if (windowToClose.tabIds.indexOf(extensionTabId) === -1) {
      const removedIndex: number = this._sortingSessionService.data.findIndex(window => window.id === windowId);
      this._states[removedIndex] = SortingSessionComponent.windowRemovedState;
      // remainder of window removal occurs in the animation callback this.onAnimationStateChange()
    // if window contains extension tab, then close the other tabs but not the window
    } else {
      for (const tabId of windowToClose.tabIds) {
        if (tabId !== extensionTabId) {
          windowToClose.removeTab(tabId);
        }
      }
    }

    this._changeDetectorRef.detectChanges();
  }

  public resetChanges(): void {
    this._sortingSessionService.resetChanges();
    this.addEmptyWindow();
    this._changeDetectorRef.detectChanges();
    this.refreshStates();
  }

  public async applyChanges(): Promise<void> {
    await this._sortingSessionService.applyChanges();
    this.addEmptyWindow();
    this._changeDetectorRef.detectChanges();
    this.refreshStates();
  }

}
