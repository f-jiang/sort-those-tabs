import {
  ChangeDetectorRef,
  Component,
  OnInit,
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/core';
import { SortingSessionService } from '../sorting-session.service';
import { Window } from '../window';
import { getExtensionWindowId } from '../utils';

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
export class SortingSessionComponent implements OnInit {

  static readonly windowRemovedState: string = 'removed';
  static readonly windowActiveState: string = 'active';

  private states: string[];

  constructor(private sortingSessionService: SortingSessionService,
              private changeDetectorRef: ChangeDetectorRef) { }

  private refreshStates(): void {
    this.states = new Array(this.sortingSessionService.data.length);
    this.states.fill(SortingSessionComponent.windowActiveState);
  }

  private addEmptyWindow(): void {
    this.sortingSessionService.addWindow(new Window());
    this.refreshStates();
  }

  private async closeWindow(windowId: number): Promise<void> {
    await this.sortingSessionService.removeWindow(windowId);
    this.refreshStates();
  }

  private async onAnimationStateChange(event: any, windowId: number): Promise<void> {
    if (event.fromState === SortingSessionComponent.windowActiveState &&
        event.toState === SortingSessionComponent.windowRemovedState) {
      await this.closeWindow(windowId);
      this.changeDetectorRef.detectChanges();
    }
  }

  async ngOnInit(): Promise<void> {
    await this.sortingSessionService.init();
    this.addEmptyWindow();
    this.refreshStates();

    this.sortingSessionService.externalDataChange$.subscribe(() => {
      this.changeDetectorRef.detectChanges();
      this.addEmptyWindow();
    });
  }

  onTabMoved(): void {
    const windows: Window[] = this.sortingSessionService.data;

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
    this.changeDetectorRef.detectChanges();
  }

  onTabClosed(tabId: number): void {
    this.sortingSessionService.removeTab(tabId);
    this.changeDetectorRef.detectChanges();
  }

  async onWindowClosed(windowId: number): Promise<void> {
    // don't run animation if window to close contains extension window
    if (windowId === await getExtensionWindowId()) {
      await this.closeWindow(windowId);
    } else {
      const removedIndex: number = this.sortingSessionService.data.findIndex(window => window.id === windowId);
      this.states[removedIndex] = SortingSessionComponent.windowRemovedState;
      // remainder of window removal occurs in the animation callback this.onAnimationStateChange()
    }

    this.changeDetectorRef.detectChanges();
  }

  resetChanges(): void {
    this.sortingSessionService.resetChanges();
    this.addEmptyWindow();
    this.changeDetectorRef.detectChanges();
    this.refreshStates();
  }

  async applyChanges(): Promise<void> {
    await this.sortingSessionService.applyChanges();
    this.addEmptyWindow();
    this.changeDetectorRef.detectChanges();
    this.refreshStates();
  }

}
