import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';

export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async get<T>(path: string, expectedStatus = 200): Promise<{ response: APIResponse; body: T }> {
    const response = await this.request.get(path);
    expect(response.status()).toBe(expectedStatus);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = (await response.json()) as T;
    return { response, body };
  }

  async post<T>(path: string, data: unknown, expectedStatus = 201): Promise<{ response: APIResponse; body: T }> {
    const response = await this.request.post(path, { data });
    expect(response.status()).toBe(expectedStatus);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = (await response.json()) as T;
    return { response, body };
  }
}
