import { NextRequest, NextResponse } from "next/server";
import { newApiClient } from "@/lib/newapi/client";

export async function POST(request: NextRequest) {
  try {
    const demoUser = request.cookies.get("demo_user")?.value;
    if (!demoUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "키 이름을 입력해주세요." },
        { status: 400 }
      );
    }

    // Create token in New API
    const tokenName = `demo_${name.trim()}`;
    const newApiToken = await newApiClient.createToken({
      name: tokenName,
      remain_quota: 500000,
    });

    const keyPreview = newApiToken.key
      ? newApiToken.key.slice(0, 10) + "..."
      : "sk-...";

    return NextResponse.json({
      key: newApiToken.key,
      key_name: name.trim(),
      key_preview: keyPreview,
      token_id: newApiToken.id,
    });
  } catch (error) {
    console.error("Key creation error:", error);
    return NextResponse.json(
      { error: "키 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
