"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OllamaRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistered: () => void;
}

export function OllamaRegisterDialog({
  open,
  onOpenChange,
  onRegistered,
}: OllamaRegisterDialogProps) {
  const [serverName, setServerName] = useState("");
  const [serverUrl, setServerUrl] = useState("http://localhost:11434");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverName.trim() || !serverUrl.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/ollama/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          server_name: serverName.trim(),
          server_url: serverUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "등록에 실패했습니다.");
        return;
      }

      toast.success(
        `서버가 등록되었습니다. (${data.models?.length || 0}개 모델 발견)`
      );
      setServerName("");
      setServerUrl("http://localhost:11434");
      onRegistered();
    } catch {
      toast.error("서버 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ollama 서버 등록</DialogTitle>
          <DialogDescription>
            로컬 또는 원격 Ollama 서버를 등록하세요. 서버에 설치된 모델이 자동으로
            감지됩니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serverName">서버 이름</Label>
            <Input
              id="serverName"
              placeholder="예: my-local-gpu"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serverUrl">서버 URL</Label>
            <Input
              id="serverUrl"
              placeholder="http://localhost:11434"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground">
              Ollama가 실행 중인 서버의 주소를 입력하세요.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              등록
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
