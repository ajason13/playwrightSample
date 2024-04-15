import type { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class TodoPage extends BasePage {
  readonly inputBox: Locator;
  readonly todoItems: Locator;
  readonly todoItemText: Locator;
  readonly todoItemCount: Locator;
  readonly labelMarkAll: Locator;
  readonly btnClearCompleted: Locator;
  readonly selectedTodoFilter: Locator;

  constructor(public readonly page: Page) {
    super(page);
    this.inputBox = page.locator('input.new-todo');
    this.todoItems = page.getByTestId('todo-item');
    this.todoItemText = page.getByTestId('todo-title');
    this.todoItemCount = page.getByTestId('todo-count');
    this.labelMarkAll = page.getByLabel('Mark all as complete');
    this.btnClearCompleted = page.getByText('Clear completed');
    this.selectedTodoFilter = this.page.locator('a.selected');
  }

  async goto() {
    await super.goto('/todomvc/');
  }

  async addToDo(text: string) {
    await this.inputBox.fill(text);
    await this.inputBox.press('Enter');
  }

  async editToDo(originalString: string, newString: string) {
    try {
      const todo = this.todoItemText.filter({ hasText: originalString });
      await todo.dblclick();
      await todo.locator('../../input').fill(newString);
      await todo.press('Enter');
    } catch {
      throw Error(`'${originalString}' todo doesn't exist.`);
    }
  }

  async remove(text: string) {
    const todo = this.todoItems.filter({ hasText: text });
    await todo.hover();
    await todo.getByLabel('Delete').click();
  }

  async markAllTodosAsComplete() {
    await this.labelMarkAll.click();
  }

  async clearCompletedTodos() {
    const clearCompletedIsVisible = await this.btnClearCompleted.isVisible();
    if (!clearCompletedIsVisible) {
      throw Error('No completed todos are available to clear');
    }

    await this.btnClearCompleted.click();
  }

  async checkTodoItem(todoText: string) {
    // Find todo
    try {
      await this.todoItemText
        .filter({ hasText: todoText })
        .locator('../input')
        .click();
    } catch {
      throw Error(`'${todoText}' todo doesn't exist.`);
    }
  }

  async isTodoChecked(todoText: string): Promise<boolean> {
    // Find todo
    try {
      return await this.todoItemText
        .filter({ hasText: todoText })
        .locator('../input')
        .isChecked();
    } catch {
      throw Error(`'${todoText}' todo doesn't exist.`);
    }
  }

  async removeAll() {
    while ((await this.todoItems.count()) > 0) {
      await this.todoItems.first().hover();
      await this.todoItems.getByLabel('Delete').first().click();
    }
  }

  async filterTodos(filter: 'All' | 'Active' | 'Completed') {
    await this.page.getByRole('link', { name: filter }).click();
  }
}
