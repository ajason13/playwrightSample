import { test as base, expect, type Page } from '@playwright/test';
import { TodoPage } from '../pages/todo.page';

// Navigate to Todo page
const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage);
  }
});

const TODO_ITEMS = [
  'buy some cheese',
  'feed the cat',
  'book a doctors appointment'
];

test.describe('Todo page', () => {
  test('should allow me to add todo items', async ({ todoPage, page }) => {
    await todoPage.addToDo(TODO_ITEMS[0]);

    // Make sure the list only has one todo item.
    await expect(todoPage.todoItemText).toHaveText([TODO_ITEMS[0]]);

    await todoPage.addToDo(TODO_ITEMS[1]);

    // Make sure the list now has two todo items.
    await expect(todoPage.todoItemText).toHaveText([
      TODO_ITEMS[0],
      TODO_ITEMS[1]
    ]);

    await checkNumberOfTodosInLocalStorage(page, 2);
  });

  test('should clear text input field when an item is added', async ({
    todoPage,
    page
  }) => {
    await todoPage.addToDo(TODO_ITEMS[0]);

    // Check that input is empty.
    await expect(todoPage.inputBox).toBeEmpty();
    await checkNumberOfTodosInLocalStorage(page, 1);
  });

  test('should append new items to the bottom of the list', async ({
    todoPage,
    page
  }) => {
    // Create 3 items.
    await createDefaultTodos(todoPage);

    // Check test using different methods.
    await expect(page.getByText('3 items left')).toBeVisible();
    await expect(todoPage.todoItemCount).toHaveText('3 items left');
    await expect(todoPage.todoItemCount).toContainText('3');
    await expect(todoPage.todoItemCount).toHaveText(/3/);

    // Check all items in one call.
    await expect(todoPage.todoItemText).toHaveText(TODO_ITEMS);
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should allow me to mark all items as completed', async ({
    todoPage,
    page
  }) => {
    await createDefaultTodos(todoPage);
    await todoPage.markAllTodosAsComplete();

    // Ensure all todos have 'completed' class.
    await expect(todoPage.todoItems).toHaveClass([
      'completed',
      'completed',
      'completed'
    ]);
    await checkNumberOfCompletedTodosInLocalStorage(page, 3);
  });

  test('should allow me to clear the complete state of all items', async ({
    todoPage
  }) => {
    await createDefaultTodos(todoPage);
    // Check and then immediately uncheck.
    await todoPage.markAllTodosAsComplete();
    await todoPage.markAllTodosAsComplete();

    // Should be no completed classes.
    await expect(todoPage.todoItems).toHaveClass(['', '', '']);
  });

  test('complete all checkbox should update state when items are completed / cleared', async ({
    todoPage,
    page
  }) => {
    await createDefaultTodos(todoPage);
    await todoPage.markAllTodosAsComplete();
    await expect(todoPage.labelMarkAll).toBeChecked();
    await checkNumberOfCompletedTodosInLocalStorage(page, 3);

    // Uncheck first todo.
    await todoPage.checkTodoItem(TODO_ITEMS[0]);

    // Make sure toggleAll is not checked.
    await expect(todoPage.labelMarkAll).not.toBeChecked();

    // Check first todo
    await todoPage.checkTodoItem(TODO_ITEMS[0]);
    await checkNumberOfCompletedTodosInLocalStorage(page, 3);

    // Assert the toggle all is checked again.
    await expect(todoPage.labelMarkAll).toBeChecked();
  });
});

async function createDefaultTodos(todoPage: TodoPage) {
  for (const item of TODO_ITEMS) {
    await todoPage.addToDo(item);
  }
}

async function checkNumberOfTodosInLocalStorage(page: Page, expected: number) {
  await page.waitForFunction((e) => {
    return JSON.parse(localStorage['react-todos']).length === e;
  }, expected);
}

async function checkNumberOfCompletedTodosInLocalStorage(
  page: Page,
  expected: number
) {
  return await page.waitForFunction((e) => {
    return (
      JSON.parse(localStorage['react-todos']).filter(
        (todo: any) => todo.completed
      ).length === e
    );
  }, expected);
}

async function checkTodosInLocalStorage(page: Page, title: string) {
  return await page.waitForFunction((t) => {
    return JSON.parse(localStorage['react-todos'])
      .map((todo: any) => todo.title)
      .includes(t);
  }, title);
}
