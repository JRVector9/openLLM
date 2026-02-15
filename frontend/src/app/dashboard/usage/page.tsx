"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { UsageChart } from "@/components/dashboard/usage-chart";
import type { DailyUsage } from "@/lib/types";

export default function UsagePage() {
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week");

  const fetchUsage = async (p: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/usage?period=${p}`);
      const data = await res.json();
      if (data.dailyUsage) setDailyUsage(data.dailyUsage);
    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage(period);
  }, [period]);

  const handleExportCSV = () => {
    if (dailyUsage.length === 0) return;

    const headers = [
      "날짜",
      "총 토큰",
      "프롬프트 토큰",
      "완성 토큰",
      "요청 수",
    ];
    const rows = dailyUsage.map((d) => [
      d.date,
      d.total_tokens,
      d.prompt_tokens,
      d.completion_tokens,
      d.request_count,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `openllm-usage-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalTokens = dailyUsage.reduce((sum, d) => sum + d.total_tokens, 0);
  const totalRequests = dailyUsage.reduce(
    (sum, d) => sum + d.request_count,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">사용량</h2>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">오늘</SelectItem>
              <SelectItem value="week">이번 주</SelectItem>
              <SelectItem value="month">이번 달</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={dailyUsage.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              기간 내 총 토큰
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTokens.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              기간 내 총 요청
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRequests.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>일별 사용량</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-80" />
          ) : dailyUsage.length === 0 ? (
            <div className="flex h-80 items-center justify-center text-muted-foreground">
              해당 기간에 사용 내역이 없습니다.
            </div>
          ) : (
            <UsageChart data={dailyUsage} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
