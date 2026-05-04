import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import { Request, Response, Headers, fetch } from "undici";

// Polyfill text encoding
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Polyfill Web Fetch API (Request, Response, Headers, fetch)
// needed for API route tests running in Node/jsdom environment
(global as any).Request  = Request;
(global as any).Response = Response;
(global as any).Headers  = Headers;
(global as any).fetch    = jest.fn(() =>
  Promise.resolve({ ok: false, json: () => Promise.resolve(null) })
);
