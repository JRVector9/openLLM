import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: keys, error } = await supabase
      .from("user_api_keys")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "키 목록을 가져오는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ keys: keys || [] });
  } catch (error) {
    console.error("Key list error:", error);
    return NextResponse.json(
      { error: "키 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
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

    // Get the key to find New API token ID
    const { data: key } = await supabase
      .from("user_api_keys")
      .select("new_api_token_id")
      .eq("id", keyId)
      .eq("user_id", user.id)
      .single();

    if (!key) {
      return NextResponse.json(
        { error: "키를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Delete from New API
    const { newApiClient } = await import("@/lib/newapi/client");
    try {
      await newApiClient.deleteToken(key.new_api_token_id);
    } catch {
      // Continue even if New API deletion fails
    }

    // Delete from Supabase
    const { error: dbError } = await supabase
      .from("user_api_keys")
      .delete()
      .eq("id", keyId)
      .eq("user_id", user.id);

    if (dbError) {
      return NextResponse.json(
        { error: "키 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Key delete error:", error);
    return NextResponse.json(
      { error: "키 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
