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
import { Copy, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface KeyCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function KeyCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: KeyCreateDialogProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/keys/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "키 생성에 실패했습니다.");
        return;
      }

      setCreatedKey(data.key);
      toast.success("API 키가 생성되었습니다!");
    } catch {
      toast.error("키 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      toast.success("키가 클립보드에 복사되었습니다.");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      if (createdKey) {
        onCreated();
      }
      setName("");
      setCreatedKey(null);
      setCopied(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {createdKey ? "키가 생성되었습니다" : "새 API 키 발급"}
          </DialogTitle>
          <DialogDescription>
            {createdKey
              ? "이 키는 다시 표시되지 않습니다. 지금 복사해두세요."
              : "키 이름을 입력하여 새 API 키를 발급받으세요."}
          </DialogDescription>
        </DialogHeader>

        {createdKey ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md border bg-muted p-3 text-sm break-all">
                {createdKey}
              </code>
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-destructive font-medium">
              이 키는 다시 확인할 수 없습니다. 안전한 곳에 보관해주세요.
            </p>
            <Button
              className="w-full"
              onClick={() => handleClose(false)}
            >
              확인
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyName">키 이름</Label>
              <Input
                id="keyName"
                placeholder="예: n8n-workflow, my-app"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => handleClose(false)}
              >
                취소
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                발급
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
