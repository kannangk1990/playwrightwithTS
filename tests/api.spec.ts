import { expect } from '@playwright/test';
import { test } from '../src/fixtures/test';

type Todo = {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
};

test.describe('API smoke tests', { tag: '@api' }, () => {
  test('can retrieve a todo', async ({ apiClient }) => {
    const { body } = await apiClient.get<Todo>('/todos/1');

    expect(body).toMatchObject({ id: 1, userId: 1 });
    expect(body.title).toBeTruthy();
  });
});
