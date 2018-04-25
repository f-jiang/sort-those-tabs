export class Tab {

  id: number;
  index: number;
  windowId: number;
  url: string;
  title: string;
  favIconUrl: string;

  static fromChromeTab(chromeTab: chrome.tabs.Tab): Tab {
    return new TabBuilder()
      .setId(chromeTab.id)
      .setIndex(chromeTab.index)
      .setWindowId(chromeTab.windowId)
      .setUrl(chromeTab.url)
      .setTitle(chromeTab.title)
      .setFavIconUrl(chromeTab.favIconUrl)
      .build();
  }

}

export class TabBuilder {

  private _tab: Tab;

  constructor() {
    this._tab = new Tab();
  }

  setId(id: number): TabBuilder {
    this._tab.id = id;
    return this;
  }

  setIndex(index: number): TabBuilder {
    this._tab.index = index;
    return this;
  }

  setWindowId(windowId: number): TabBuilder {
    this._tab.windowId = windowId;
    return this;
  }

  setUrl(url: string): TabBuilder {
    this._tab.url = url;
    return this;
  }

  setTitle(title: string): TabBuilder {
    this._tab.title = title;
    return this;
  }

  setFavIconUrl(favIconUrl: string): TabBuilder {
    this._tab.favIconUrl = favIconUrl;
    return this;
  }

  build(): Tab {
    return this._tab;
  }

}
