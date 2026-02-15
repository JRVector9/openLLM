import { NextRequest, NextResponse } from "next/server";
import { newApiClient } from "@/lib/newapi/client";

// In-memory store for demo (no Supabase)
const ollamaServers: Array<{
  id: string;
  server_name: string;
  server_url: string;
  models: string[];
  new_api_channel_id: number | null;
  created_at: string;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const demoUser = request.cookies.get("demo_user")?.value;
    if (!demoUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { server_name, server_url } = body;

    if (!server_name || !server_url) {
      return NextResponse.json(
        { error: "서버 이름과 URL을 입력해주세요." },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(server_url);
    } catch {
      return NextResponse.json(
        { error: "올바른 URL 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // Health check
    let models: string[] = [];
    try {
      const res = await fetch(`${server_url}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        models = (data.models || []).map(
          (m: { name: string }) => m.name
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Ollama 서버에 연결할 수 없습니다. URL을 확인해주세요." },
        { status: 400 }
      );
    }

    if (models.length === 0) {
      return NextResponse.json(
        { error: "서버에 설치된 모델이 없습니다." },
        { status: 400 }
      );
    }

    // Create channel in New API (type 2 = Ollama)
    let channelId: number | null = null;
    try {
      const channel = await newApiClient.createChannel({
        name: `ollama_demo_${server_name}`,
        type: 2,
        key: "ollama",
        base_url: server_url,
        models: models.join(","),
        group: "ollama",
      });
      channelId = (channel as { id: number })?.id ?? null;
    } catch {
      // Channel creation is optional
    }

    const server = {
      id: crypto.randomUUID(),
      server_name: server_name.trim(),
      server_url: server_url.trim(),
      models,
      new_api_channel_id: channelId,
      created_at: new Date().toISOString(),
    };

    ollamaServers.push(server);

    return NextResponse.json({ server, models });
  } catch (error) {
    console.error("Ollama register error:", error);
    return NextResponse.json(
      { error: "서버 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const demoUser = request.cookies.get("demo_user")?.value;
    if (!demoUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ servers: ollamaServers });
  } catch (error) {
    console.error("Ollama list error:", error);
    return NextResponse.json(
      { error: "서버 목록 조회 중 오류가 발생했습니다." },
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

    const { searchParams } = request.nextUrl;
    const serverId = searchParams.get("id");

    if (!serverId) {
      return NextResponse.json(
        { error: "서버 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const idx = ollamaServers.findIndex((s) => s.id === serverId);
    if (idx !== -1) {
      ollamaServers.splice(idx, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ollama delete error:", error);
    return NextResponse.json(
      { error: "서버 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
