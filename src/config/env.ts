const sauceDemoBaseUrl = 'https://www.saucedemo.com';

function readValue(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const environment = {
  baseUrl: readValue('BASE_URL', sauceDemoBaseUrl),
  sauceUsername: readValue('SAUCE_USERNAME', 'standard_user'),
  saucePassword: readValue('SAUCE_PASSWORD', 'secret_sauce'),
};
