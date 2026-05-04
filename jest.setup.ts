import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Must be set BEFORE undici loads — it reads these at import time
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Request, Response, Headers } = require("undici");
(global as any).Request  = Request;
(global as any).Response = Response;
(global as any).Headers  = Headers;

// Default fetch mock — individual tests can override
(global as any).fetch = jest.fn(() =>
  Promise.resolve({ ok: false, json: () => Promise.resolve(null) })
);
