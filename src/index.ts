export interface Env {
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Delegate all requests to the static assets
    return env.ASSETS.fetch(request)
  }
}
