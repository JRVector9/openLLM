"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { UserApiKey } from "@/lib/types";

interface KeyCardProps {
  apiKey: UserApiKey;
  onDeleted: () => void;
}

export function KeyCard({ apiKey, onDeleted }: KeyCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey.key_preview);
    toast.success("키 미리보기가 복사되었습니다.");
  };

  const handleDelete = async () => {
    if (!confirm(`"${apiKey.key_name}" 키를 삭제하시겠습니까?`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/keys/list?id=${apiKey.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("키가 삭제되었습니다.");
        onDeleted();
      } else {
        const data = await res.json();
        toast.error(data.error || "삭제에 실패했습니다.");
      }
    } catch {
      toast.error("키 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{apiKey.key_name}</span>
          <Badge variant={apiKey.is_active ? "default" : "secondary"}>
            {apiKey.is_active ? "활성" : "비활성"}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <code className="rounded bg-muted px-2 py-0.5">
            {apiKey.key_preview}
          </code>
          <span>·</span>
          <span>
            {new Date(apiKey.created_at).toLocaleDateString("ko-KR")}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleCopy}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 text-destructive" />
          )}
        </Button>
      </div>
    </div>
  );
}
