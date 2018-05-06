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

@Component({
  selector: 'app-sorting-session',
  templateUrl: './sorting-session.component.html',
  styleUrls: ['./sorting-session.component.css'],
  animations: [
    trigger('removal', [
      state('void', style({opacity: 0})),
      state('*', style({opacity: 1})),
      transition('* => void', animate('250ms'))
    ])
  ]
})
export class SortingSessionComponent implements OnInit {

  constructor(private sortingSessionService: SortingSessionService,
              private changeDetectorRef: ChangeDetectorRef) { }

  private addEmptyWindow(): void {
    this.sortingSessionService.addWindow(new Window());
  }

  async ngOnInit(): Promise<void> {
    await this.sortingSessionService.init();
    this.addEmptyWindow();
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
    await this.sortingSessionService.removeWindow(windowId);
    this.changeDetectorRef.detectChanges();
  }

  resetChanges(): void {
    this.sortingSessionService.resetChanges();
    this.addEmptyWindow();
    this.changeDetectorRef.detectChanges();
  }

  async applyChanges(): Promise<void> {
    await this.sortingSessionService.applyChanges();
    this.addEmptyWindow();
    this.changeDetectorRef.detectChanges();
  }

}
