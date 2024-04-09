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
    todoPage.addToDo(TODO_ITEMS[0]);

    // Make sure the list only has one todo item.
    await expect(todoPage.todoItemText).toHaveText([TODO_ITEMS[0]]);

    todoPage.addToDo(TODO_ITEMS[1]);

    // Make sure the list now has two todo items.
    await expect(todoPage.todoItemText).toHaveText([
      TODO_ITEMS[0],
      TODO_ITEMS[1]
    ]);

    await checkNumberOfTodosInLocalStorage(page, 2);
  });

  //   test('should clear text input field when an item is added', async ({ page }) => {
  //     // create a new todo locator
  //     const newTodo = page.getByPlaceholder('What needs to be done?');

  //     // Create one todo item.
  //     await newTodo.fill(TODO_ITEMS[0]);
  //     await newTodo.press('Enter');

  //     // Check that input is empty.
  //     await expect(newTodo).toBeEmpty();
  //     await checkNumberOfTodosInLocalStorage(page, 1);
  //   });

  //   test('should append new items to the bottom of the list', async ({ page }) => {
  //     // Create 3 items.
  //     await createDefaultTodos(page);

  //     // create a todo count locator
  //     const todoCount = page.getByTestId('todo-count')

  //     // Check test using different methods.
  //     await expect(page.getByText('3 items left')).toBeVisible();
  //     await expect(todoCount).toHaveText('3 items left');
  //     await expect(todoCount).toContainText('3');
  //     await expect(todoCount).toHaveText(/3/);

  //     // Check all items in one call.
  //     await expect(page.getByTestId('todo-title')).toHaveText(TODO_ITEMS);
  //     await checkNumberOfTodosInLocalStorage(page, 3);
  //   });
});

async function createDefaultTodos(page: Page) {
  // create a new todo locator
  const newTodo = page.getByPlaceholder('What needs to be done?');

  for (const item of TODO_ITEMS) {
    await newTodo.fill(item);
    await newTodo.press('Enter');
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
