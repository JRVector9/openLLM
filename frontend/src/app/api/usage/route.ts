import { NextRequest, NextResponse } from "next/server";
import { newApiClient } from "@/lib/newapi/client";

interface LogEntry {
  token_id: number;
  model_name: string;
  prompt_tokens: number;
  completion_tokens: number;
  created_at: number;
}

export async function GET(request: NextRequest) {
  try {
    const demoUser = request.cookies.get("demo_user")?.value;
    if (!demoUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const period = searchParams.get("period") || "week"; // day, week, month

    // Get all tokens from New API
    const tokens = await newApiClient.listTokens();

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ usage: [], dailyUsage: [] });
    }

    // Calculate time range
    const now = Math.floor(Date.now() / 1000);
    let startTime: number;
    switch (period) {
      case "day":
        startTime = now - 86400;
        break;
      case "month":
        startTime = now - 86400 * 30;
        break;
      case "week":
      default:
        startTime = now - 86400 * 7;
        break;
    }

    // Fetch logs for each key
    const allLogs: LogEntry[] = [];
    for (const token of tokens) {
      try {
        const logs = (await newApiClient.getUsageLogs(
          token.id,
          startTime
        )) as LogEntry[];
        allLogs.push(...logs);
      } catch {
        // Skip failed log fetches
      }
    }

    // Aggregate by day
    const dailyMap = new Map<
      string,
      {
        date: string;
        total_tokens: number;
        prompt_tokens: number;
        completion_tokens: number;
        request_count: number;
      }
    >();

    for (const log of allLogs) {
      const date = new Date(log.created_at * 1000)
        .toISOString()
        .split("T")[0];
      const existing = dailyMap.get(date) || {
        date,
        total_tokens: 0,
        prompt_tokens: 0,
        completion_tokens: 0,
        request_count: 0,
      };
      existing.total_tokens += log.prompt_tokens + log.completion_tokens;
      existing.prompt_tokens += log.prompt_tokens;
      existing.completion_tokens += log.completion_tokens;
      existing.request_count += 1;
      dailyMap.set(date, existing);
    }

    const dailyUsage = Array.from(dailyMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return NextResponse.json({
      usage: allLogs.slice(0, 100), // Latest 100 logs
      dailyUsage,
    });
  } catch (error) {
    console.error("Usage fetch error:", error);
    return NextResponse.json(
      { error: "사용량 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
