export function getRole(req: Request): "admin" | "viewer" | null {
  const cookie = req.headers.get("cookie") ?? "";
  if (cookie.includes("nexus-auth=admin")) return "admin";
  if (cookie.includes("nexus-auth=viewer")) return "viewer";
  return null;
}

export function getUserId(req: Request): number | null {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/nexus-uid=(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export function requireAuth(req: Request): boolean {
  return getRole(req) !== null;
}

export function requireAdmin(req: Request): boolean {
  return getRole(req) === "admin";
}
