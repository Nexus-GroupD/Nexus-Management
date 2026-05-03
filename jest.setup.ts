import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// jsdom doesn't include fetch; provide a no-op mock so components that call
// fetch in useEffect don't crash during rendering tests.
(global as any).fetch = jest.fn(() =>
  Promise.resolve({ ok: false, json: () => Promise.resolve(null) })
);