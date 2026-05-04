import { NextRequest, NextResponse } from "next/server";

const expired = { httpOnly: true, sameSite: "lax" as const, expires: new Date(0), path: "/" };

export async function GET(req: NextRequest) {
  const url = new URL("/login", req.url);
  const res = NextResponse.redirect(url);
  res.cookies.set("nexus-auth", "", expired);
  res.cookies.set("nexus-uid", "", expired);
  return res;
}

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("nexus-auth", "", expired);
  res.cookies.set("nexus-uid", "", expired);
  return res;
}
