import { test as base, expect, type Page } from '@playwright/test';
import { TodoPage } from '../pages/todo.page';

// Navigate to Todo page before every test
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

  test('should complete all checkbox update state when items are completed / cleared', async ({
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

  test('should allow me to mark items as complete', async ({ todoPage }) => {
    // Create todo items
    await createDefaultTodos(todoPage);

    // Check first item.
    await todoPage.checkTodoItem(TODO_ITEMS[0]);
    await expect(todoPage.todoItems.nth(0)).toHaveClass('completed');

    // Check second item.
    await expect(todoPage.todoItems.nth(1)).not.toHaveClass('completed');
    await todoPage.checkTodoItem(TODO_ITEMS[1]);

    // Assert completed class.
    await expect(todoPage.todoItems.nth(0)).toHaveClass('completed');
    await expect(todoPage.todoItems.nth(1)).toHaveClass('completed');
  });

  test('should allow me to un-mark items as complete', async ({
    todoPage,
    page
  }) => {
    // Create todo items
    await createDefaultTodos(todoPage);

    // Check first todo
    await todoPage.checkTodoItem(TODO_ITEMS[0]);
    await expect(todoPage.todoItems.nth(0)).toHaveClass('completed');
    await expect(todoPage.todoItems.nth(1)).not.toHaveClass('completed');
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);

    // Uncheck first todo
    await todoPage.checkTodoItem(TODO_ITEMS[0]);
    await expect(todoPage.todoItems.nth(0)).not.toHaveClass('completed');
    await expect(todoPage.todoItems.nth(1)).not.toHaveClass('completed');
    await checkNumberOfCompletedTodosInLocalStorage(page, 0);
  });

  test('should allow me to edit an item', async ({ todoPage, page }) => {
    const updatedTodoString = 'buy some sausages';
    await createDefaultTodos(todoPage);
    await todoPage.editToDo(TODO_ITEMS[1], updatedTodoString);

    // Explicitly assert the new text value.
    await expect(todoPage.todoItems).toHaveText([
      TODO_ITEMS[0],
      updatedTodoString,
      TODO_ITEMS[2]
    ]);
    await checkTodosInLocalStorage(page, updatedTodoString);
  });

  test('should hide other controls when editing todo', async ({
    todoPage,
    page
  }) => {
    await createDefaultTodos(todoPage);
    const todoItem = todoPage.todoItems.nth(1);
    await todoItem.dblclick();
    await expect(todoItem.getByRole('checkbox')).not.toBeVisible();
    await expect(
      todoItem.locator('label', {
        hasText: TODO_ITEMS[1]
      })
    ).not.toBeVisible();
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should save edits on blur', async ({ todoPage, page }) => {
    const updatedTodoString = 'buy some sausages';

    await createDefaultTodos(todoPage);

    const todoItems = todoPage.todoItems;
    await todoItems.nth(1).dblclick();
    await todoItems
      .nth(1)
      .getByRole('textbox', { name: 'Edit' })
      .fill(updatedTodoString);
    await todoItems
      .nth(1)
      .getByRole('textbox', { name: 'Edit' })
      .dispatchEvent('blur');

    await expect(todoItems).toHaveText([
      TODO_ITEMS[0],
      updatedTodoString,
      TODO_ITEMS[2]
    ]);
    await checkTodosInLocalStorage(page, updatedTodoString);
  });

  test('should trim entered text', async ({ todoPage, page }) => {
    await createDefaultTodos(todoPage);

    await todoPage.editToDo(TODO_ITEMS[1], '    buy some sausages    ');

    await expect(todoPage.todoItems).toHaveText([
      TODO_ITEMS[0],
      'buy some sausages',
      TODO_ITEMS[2]
    ]);
    await checkTodosInLocalStorage(page, 'buy some sausages');
  });

  test('should remove the item if an empty text string was entered', async ({
    todoPage,
    page
  }) => {
    await createDefaultTodos(todoPage);

    await todoPage.editToDo(TODO_ITEMS[1], '');

    await expect(todoPage.todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
  });

  test('should cancel edits on escape', async ({ todoPage }) => {
    await createDefaultTodos(todoPage);

    const todoItems = todoPage.todoItems;
    await todoItems.nth(1).dblclick();
    await todoItems
      .nth(1)
      .getByRole('textbox', { name: 'Edit' })
      .fill('buy some sausages');
    await todoItems
      .nth(1)
      .getByRole('textbox', { name: 'Edit' })
      .press('Escape');

    await expect(todoItems).toHaveText(TODO_ITEMS);
  });

  test('should display the current number of todo items', async ({
    todoPage,
    page
  }) => {
    await todoPage.addToDo(TODO_ITEMS[0]);
    await expect(todoPage.todoItemCount).toContainText('1');

    await todoPage.addToDo(TODO_ITEMS[1]);
    await expect(todoPage.todoItemCount).toContainText('2');

    await checkNumberOfTodosInLocalStorage(page, 2);
  });

  test('should display the correct text', async ({ todoPage }) => {
    await createDefaultTodos(todoPage);
    await todoPage.checkTodoItem(TODO_ITEMS[0]);
    await expect(todoPage.btnClearCompleted).toBeVisible();
  });

  test('should remove completed items when clicked', async ({ todoPage }) => {
    await createDefaultTodos(todoPage);
    await todoPage.checkTodoItem(TODO_ITEMS[1]);
    await todoPage.clearCompletedTodos();
    await expect(todoPage.todoItems).toHaveCount(2);
    await expect(todoPage.todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
  });

  test('should be hidden when there are no items that are completed', async ({
    todoPage
  }) => {
    await createDefaultTodos(todoPage);
    await todoPage.checkTodoItem(TODO_ITEMS[0]);
    await todoPage.clearCompletedTodos();
    await expect(todoPage.btnClearCompleted).toBeHidden();
  });

  test('should persist its data', async ({ todoPage, page }) => {
    await createDefaultTodos(todoPage);

    await todoPage.checkTodoItem(TODO_ITEMS[0]);

    await expect(todoPage.todoItemText).toHaveText([
      TODO_ITEMS[0],
      TODO_ITEMS[1],
      TODO_ITEMS[2]
    ]);
    await expect(todoPage.isTodoChecked(TODO_ITEMS[0])).toBeTruthy();
    await expect(todoPage.todoItems).toHaveClass(['completed', '', '']);

    // Ensure there is 1 completed item.
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);

    // Now reload.
    await page.reload();
    await expect(todoPage.todoItemText).toHaveText([
      TODO_ITEMS[0],
      TODO_ITEMS[1],
      TODO_ITEMS[2]
    ]);
    await expect(todoPage.isTodoChecked(TODO_ITEMS[0])).toBeTruthy();
    await expect(todoPage.todoItems).toHaveClass(['completed', '', '']);
  });

  test('should allow me to display active items', async ({
    todoPage,
    page
  }) => {
    await createDefaultTodos(todoPage);
    await todoPage.checkTodoItem(TODO_ITEMS[1]);

    await checkNumberOfCompletedTodosInLocalStorage(page, 1);

    await todoPage.filterTodos('Active');
    await expect(todoPage.todoItems).toHaveCount(2);
    await expect(todoPage.todoItemText).toHaveText([
      TODO_ITEMS[0],
      TODO_ITEMS[2]
    ]);
  });

  test('should respect the back button', async ({ todoPage, page }) => {
    await createDefaultTodos(todoPage);
    await todoPage.checkTodoItem(TODO_ITEMS[1]);

    await checkNumberOfCompletedTodosInLocalStorage(page, 1);

    await test.step('Showing all items', async () => {
      await todoPage.filterTodos('All');
      await expect(todoPage.todoItems).toHaveCount(3);
    });

    await test.step('Showing active items', async () => {
      await todoPage.filterTodos('Active');
    });

    await test.step('Showing completed items', async () => {
      await todoPage.filterTodos('Completed');
    });

    await expect(todoPage.todoItems).toHaveCount(1);
    await page.goBack();
    await expect(todoPage.todoItems).toHaveCount(2);
    await page.goBack();
    await expect(todoPage.todoItems).toHaveCount(3);
  });

  test('should allow me to display completed items', async ({
    todoPage,
    page
  }) => {
    await createDefaultTodos(todoPage);

    await todoPage.checkTodoItem(TODO_ITEMS[1]);
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);
    await todoPage.filterTodos('Completed');

    await expect(todoPage.todoItems).toHaveCount(1);
  });

  test('should allow me to display all items', async ({ todoPage, page }) => {
    await createDefaultTodos(todoPage);
    await todoPage.checkTodoItem(TODO_ITEMS[1]);
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);

    await todoPage.filterTodos('Active');
    await todoPage.filterTodos('Completed');
    await todoPage.filterTodos('All');

    await expect(todoPage.todoItems).toHaveCount(3);
  });

  test('should highlight the currently applied filter', async ({
    todoPage
  }) => {
    await createDefaultTodos(todoPage);
    await expect(todoPage.selectedTodoFilter).toHaveText('All');

    //create locators for active and completed links
    await todoPage.filterTodos('Active');

    // Page change - active items.
    await expect(todoPage.selectedTodoFilter).toHaveText('Active');
    await todoPage.filterTodos('Completed');

    // Page change - completed items.
    await expect(todoPage.selectedTodoFilter).toHaveText('Completed');
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
