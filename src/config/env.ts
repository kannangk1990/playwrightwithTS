const demoBaseUrl = 'https://www.saucedemo.com';

function readValue(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const environment = {
  baseUrl: readValue('BASE_URL', demoBaseUrl),
  apiBaseUrl: readValue('API_BASE_URL', 'https://jsonplaceholder.typicode.com'),
  sauceUsername: readValue('SAUCE_USERNAME', 'standard_user'),
  saucePassword: readValue('SAUCE_PASSWORD', 'secret_sauce'),
};

if (environment.baseUrl !== demoBaseUrl && (!process.env.SAUCE_USERNAME || !process.env.SAUCE_PASSWORD)) {
  throw new Error('SAUCE_USERNAME and SAUCE_PASSWORD are required for non-demo environments');
}
