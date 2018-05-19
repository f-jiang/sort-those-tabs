export class Tab {

  public id: number;
  public index: number;
  public windowId: number;
  public url: string;
  public title: string;
  public favIconUrl: string;

  public static fromChromeTab(chromeTab: chrome.tabs.Tab): Tab {
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

  public setId(id: number): TabBuilder {
    this._tab.id = id;
    return this;
  }

  public setIndex(index: number): TabBuilder {
    this._tab.index = index;
    return this;
  }

  public setWindowId(windowId: number): TabBuilder {
    this._tab.windowId = windowId;
    return this;
  }

  public setUrl(url: string): TabBuilder {
    this._tab.url = url;
    return this;
  }

  public setTitle(title: string): TabBuilder {
    this._tab.title = title;
    return this;
  }

  public setFavIconUrl(favIconUrl: string): TabBuilder {
    this._tab.favIconUrl = favIconUrl;
    return this;
  }

  public build(): Tab {
    return this._tab;
  }

}
