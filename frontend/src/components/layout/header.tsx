"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";

interface HeaderProps {
  displayName?: string | null;
  email?: string;
  onMenuToggle?: () => void;
}

export function Header({ displayName, email, onMenuToggle }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "demo_user=; path=/; max-age=0";
    document.cookie = "demo_name=; path=/; max-age=0";
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">OpenLLM</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {displayName || email || "User"}
        </span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </header>
  );
}
