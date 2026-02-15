"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { KeyCreateDialog } from "@/components/dashboard/key-create-dialog";
import type { UserApiKey } from "@/lib/types";

export default function KeysPage() {
  const [keys, setKeys] = useState<UserApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/keys/list");
      const data = await res.json();
      if (data.keys) setKeys(data.keys);
    } catch {
      toast.error("키 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleDelete = async (key: UserApiKey) => {
    if (!confirm(`"${key.key_name}" 키를 삭제하시겠습니까?`)) return;
    setDeletingId(key.id);
    try {
      const res = await fetch(`/api/keys/list?id=${key.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("키가 삭제되었습니다.");
        fetchKeys();
      }
    } catch {
      toast.error("삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (preview: string) => {
    navigator.clipboard.writeText(preview);
    toast.success("복사되었습니다.");
  };

  if (loading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">API 키 관리</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />새 키 발급
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>발급된 키 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              발급된 키가 없습니다.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>키</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">
                      {key.key_name}
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        {key.key_preview}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={key.is_active ? "default" : "secondary"}
                      >
                        {key.is_active ? "활성" : "비활성"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(key.created_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(key.key_preview)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(key)}
                          disabled={deletingId === key.id}
                        >
                          {deletingId === key.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <KeyCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={() => {
          setDialogOpen(false);
          fetchKeys();
        }}
      />
    </div>
  );
}
