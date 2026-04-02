import { TextEncoder, TextDecoder } from "util";
import { Request, Response, Headers, fetch } from "undici";

// Fix globals without strict typing (avoid TS conflicts)
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

(global as any).Request = Request;
(global as any).Response = Response;
(global as any).Headers = Headers;
(global as any).fetch = fetch;