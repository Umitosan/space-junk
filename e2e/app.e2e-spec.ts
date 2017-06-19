import { SpaceJunkPage } from './app.po';

describe('space-junk App', () => {
  let page: SpaceJunkPage;

  beforeEach(() => {
    page = new SpaceJunkPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
