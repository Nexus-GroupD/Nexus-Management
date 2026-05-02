export function requireAuth(req: Request) {
  const cookie = req.headers.get("cookie");

  if (!cookie) return false;

  return cookie.includes("nexus-auth=admin");
}