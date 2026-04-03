import { POST } from "../../app/api/chat/route";
jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: async () => ({
          choices: [
            { message: { content: "mock reply" } }
          ],
        }),
      },
    },
  }));
});
test("POST runs without crashing", async () => {
  const mockRequest = {
    json: async () => ({ message: "Hi" }),
  } as Request;

  const response = await POST(mockRequest);

  expect(response).toBeDefined();
});