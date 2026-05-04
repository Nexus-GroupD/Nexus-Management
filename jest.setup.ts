import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Minimal Request polyfill — no external deps needed
// Only implements what our API route tests actually use: url, headers, json()
class MockRequest {
  url: string;
  method: string;
  headers: Map<string, string>;
  private _body: string;

  constructor(url: string, init: { method?: string; headers?: Record<string, string>; body?: string } = {}) {
    this.url    = url;
    this.method = init.method ?? "GET";
    this._body  = init.body ?? "";
    this.headers = {
      get: (key: string) => (init.headers ?? {})[key.toLowerCase()] ?? (init.headers ?? {})[key] ?? null,
    } as any;
  }

  async json() {
    return JSON.parse(this._body || "{}");
  }
}

(global as any).Request = MockRequest;

// Default fetch mock — individual tests can override
(global as any).fetch = jest.fn(() =>
  Promise.resolve({ ok: false, json: () => Promise.resolve(null) })
);
