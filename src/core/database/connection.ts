export async function createClient() {
  if (typeof window === 'undefined') {
    // Dynamically import the server client only in server context to isolate next/headers from client bundles
    const { createClient: createServer } = await import('./server');
    return createServer();
  } else {
    // Dynamically import the browser client only in client (browser) context
    const { createClient: createBrowser } = await import('./client');
    return createBrowser();
  }
}
