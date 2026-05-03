import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });
  const expired = { httpOnly: true, expires: new Date(0), path: "/" };
  res.cookies.set("nexus-auth", "", expired);
  res.cookies.set("nexus-uid", "", expired);
  return res;
}
