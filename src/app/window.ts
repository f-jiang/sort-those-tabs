import { Tab } from './tab';

export class Window {

  id: number;
  tabs: Tab[] = [];

  static fromChromeWindow(chromeWindow: chrome.windows.Window): Window {
    return new WindowBuilder()
      .setId(chromeWindow.id)
      .setTabs(chromeWindow.tabs.map(chromeTab => Tab.fromChromeTab(chromeTab)))
      .build();
  }

}

export class WindowBuilder {

  private _window: Window;

  constructor() {
    this._window = new Window();
  }

  setId(id: number): WindowBuilder {
    this._window.id = id;
    return this;
  }

  setTabs(tabs: Tab[]): WindowBuilder {
    this._window.tabs = tabs;
    return this;
  }

  build(): Window {
    return this._window;
  }

}

