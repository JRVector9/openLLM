import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { newApiClient } from "@/lib/newapi/client";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
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

    // Check max keys limit
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("max_keys")
      .eq("id", user.id)
      .single();

    const { count: existingKeys } = await supabase
      .from("user_api_keys")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const maxKeys = profile?.max_keys ?? 3;
    if ((existingKeys ?? 0) >= maxKeys) {
      return NextResponse.json(
        { error: `최대 ${maxKeys}개의 키만 생성할 수 있습니다.` },
        { status: 400 }
      );
    }

    // Create token in New API
    const tokenName = `${user.id.slice(0, 8)}_${name.trim()}`;
    const newApiToken = await newApiClient.createToken({
      name: tokenName,
      remain_quota: 500000, // 5000 tokens
    });

    // Store key mapping in Supabase
    const keyPreview = newApiToken.key
      ? newApiToken.key.slice(0, 10) + "..."
      : "sk-...";

    const { error: dbError } = await supabase.from("user_api_keys").insert({
      user_id: user.id,
      key_name: name.trim(),
      new_api_token_id: newApiToken.id,
      key_preview: keyPreview,
      remain_quota: 500000,
    });

    if (dbError) {
      // Rollback: delete the New API token
      try {
        await newApiClient.deleteToken(newApiToken.id);
      } catch {
        // Best effort cleanup
      }
      return NextResponse.json(
        { error: "키 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      key: newApiToken.key,
      key_name: name.trim(),
      key_preview: keyPreview,
    });
  } catch (error) {
    console.error("Key creation error:", error);
    return NextResponse.json(
      { error: "키 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
