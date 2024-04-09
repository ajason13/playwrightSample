import type { Page, Locator } from '@playwright/test';

export class BasePage {
  page: Page;

  constructor(public readonly _page: Page) {
    this.page = _page;
  }

  async goto(partialUrl: string) {
    await this.page.goto(partialUrl);
  }

  // Add common assertions here
}
