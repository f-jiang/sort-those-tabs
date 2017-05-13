import { SortThoseTabsPage } from './app.po';

describe('sort-those-tabs App', () => {
  let page: SortThoseTabsPage;

  beforeEach(() => {
    page = new SortThoseTabsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
