import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Supabase auth disabled - return demo profile from cookie
  const demoUser = request.cookies.get("demo_user")?.value;
  const demoName = request.cookies.get("demo_name")?.value;

  if (!demoUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    profile: {
      id: "demo-user",
      email: decodeURIComponent(demoUser),
      display_name: demoName ? decodeURIComponent(demoName) : null,
      max_keys: 3,
      used_quota: 0,
      total_quota: 500000,
      created_at: new Date().toISOString(),
    },
  });
}
