"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Key, Activity, Database, Plus } from "lucide-react";
import { KeyCreateDialog } from "@/components/dashboard/key-create-dialog";
import { KeyCard } from "@/components/dashboard/key-card";
import type { UserProfile, UserApiKey } from "@/lib/types";

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [keys, setKeys] = useState<UserApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [profileRes, keysRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/keys/list"),
      ]);
      const profileData = await profileRes.json();
      const keysData = await keysRes.json();
      if (profileData.profile) setProfile(profileData.profile);
      if (keysData.keys) setKeys(keysData.keys);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleKeyCreated = () => {
    fetchData();
    setDialogOpen(false);
  };

  const handleKeyDeleted = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const usedQuota = profile?.used_quota ?? 0;
  const totalQuota = profile?.total_quota ?? 500000;
  const usagePercent = totalQuota > 0 ? (usedQuota / totalQuota) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">대시보드</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />새 키 발급
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API 키</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {keys.length} / {profile?.max_keys ?? 3}
            </div>
            <p className="text-xs text-muted-foreground">활성 키 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">사용량</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(usedQuota / 100).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              사용된 토큰 (총 {Math.round(totalQuota / 100).toLocaleString()})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">남은 할당량</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(100 - usagePercent).toFixed(1)}%
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>내 API 키</CardTitle>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Key className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                아직 발급된 API 키가 없습니다.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />첫 번째 키 발급하기
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <KeyCard
                  key={key.id}
                  apiKey={key}
                  onDeleted={handleKeyDeleted}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <KeyCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={handleKeyCreated}
      />
    </div>
  );
}
