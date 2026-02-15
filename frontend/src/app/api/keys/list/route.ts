import { NextRequest, NextResponse } from "next/server";
import { newApiClient } from "@/lib/newapi/client";

export async function GET(request: NextRequest) {
  try {
    const demoUser = request.cookies.get("demo_user")?.value;
    if (!demoUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // List tokens from New API
    const tokens = await newApiClient.listTokens();
    const keys = tokens.map((t) => ({
      id: t.id,
      key_name: t.name,
      key_preview: t.key ? t.key.slice(0, 10) + "..." : "sk-...",
      new_api_token_id: t.id,
      remain_quota: t.remain_quota,
      used_quota: t.used_quota,
      status: t.status === 1 ? "active" : "disabled",
      created_at: new Date(t.created_time * 1000).toISOString(),
    }));

    return NextResponse.json({ keys });
  } catch (error) {
    console.error("Key list error:", error);
    return NextResponse.json(
      { error: "키 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const demoUser = request.cookies.get("demo_user")?.value;
    if (!demoUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get("id");

    if (!keyId) {
      return NextResponse.json(
        { error: "키 ID가 필요합니다." },
        { status: 400 }
      );
    }

    await newApiClient.deleteToken(Number(keyId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Key delete error:", error);
    return NextResponse.json(
      { error: "키 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
