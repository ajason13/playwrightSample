import type { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class TodoPage extends BasePage {
  readonly inputBox: Locator;
  private readonly todoItems: Locator;
  readonly todoItemText: Locator;
  readonly todoItemCount: Locator;

  constructor(public readonly page: Page) {
    super(page);
    this.inputBox = page.locator('input.new-todo');
    this.todoItems = page.getByTestId('todo-item');
    this.todoItemText = page.getByTestId('todo-title');
    this.todoItemCount = page.getByTestId('todo-count');
  }

  async goto() {
    await super.goto('/todomvc/');
  }

  async addToDo(text: string) {
    await this.inputBox.fill(text);
    await this.inputBox.press('Enter');
  }

  async remove(text: string) {
    const todo = this.todoItems.filter({ hasText: text });
    await todo.hover();
    await todo.getByLabel('Delete').click();
  }

  async removeAll() {
    while ((await this.todoItems.count()) > 0) {
      await this.todoItems.first().hover();
      await this.todoItems.getByLabel('Delete').first().click();
    }
  }
}
