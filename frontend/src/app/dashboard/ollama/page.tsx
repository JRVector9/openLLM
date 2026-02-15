"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Server, Trash2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { OllamaRegisterDialog } from "@/components/dashboard/ollama-form";
import type { UserOllamaServer } from "@/lib/types";

export default function OllamaPage() {
  const [servers, setServers] = useState<UserOllamaServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchServers = async () => {
    try {
      const res = await fetch("/api/ollama/register");
      const data = await res.json();
      if (data.servers) setServers(data.servers);
    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleDelete = async (server: UserOllamaServer) => {
    if (!confirm(`"${server.server_name}" 서버를 삭제하시겠습니까?`)) return;
    setDeletingId(server.id);
    try {
      const res = await fetch(`/api/ollama/register?id=${server.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("서버가 삭제되었습니다.");
        fetchServers();
      }
    } catch {
      toast.error("삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ollama 연결</h2>
          <p className="text-sm text-muted-foreground">
            자신의 Ollama 서버를 등록하여 무제한으로 사용하세요
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          서버 등록
        </Button>
      </div>

      {servers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Server className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">등록된 서버가 없습니다</p>
            <p className="mt-1 text-sm text-muted-foreground">
              로컬 Ollama 서버를 등록하면 API를 통해 사용할 수 있습니다.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              첫 서버 등록하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {servers.map((server) => (
            <Card key={server.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                  {server.server_name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={server.is_active ? "default" : "secondary"}
                  >
                    {server.is_active ? "활성" : "비활성"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(server)}
                    disabled={deletingId === server.id}
                  >
                    {deletingId === server.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  <code className="rounded bg-muted px-2 py-0.5">
                    {server.server_url}
                  </code>
                </div>
                {server.models && server.models.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {server.models.map((model) => (
                      <Badge key={model} variant="outline" className="text-xs">
                        {model}
                      </Badge>
                    ))}
                  </div>
                )}
                {server.last_health_check && (
                  <p className="text-xs text-muted-foreground">
                    마지막 확인:{" "}
                    {new Date(server.last_health_check).toLocaleString(
                      "ko-KR"
                    )}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <OllamaRegisterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onRegistered={() => {
          setDialogOpen(false);
          fetchServers();
        }}
      />
    </div>
  );
}
