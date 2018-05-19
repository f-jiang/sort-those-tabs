import { Tab } from './tab';

export class Window {

  public id: number;
  public tabs: Tab[] = [];

  public static fromChromeWindow(chromeWindow: chrome.windows.Window): Window {
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

  public setId(id: number): WindowBuilder {
    this._window.id = id;
    return this;
  }

  public setTabs(tabs: Tab[]): WindowBuilder {
    this._window.tabs = tabs;
    return this;
  }

  public build(): Window {
    return this._window;
  }

}
