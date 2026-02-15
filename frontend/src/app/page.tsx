import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Key, BarChart3, Server } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b px-4 lg:px-8">
        <h1 className="text-lg font-bold">OpenLLM</h1>
        <div className="flex items-center gap-2">
          <Link href="/docs">
            <Button variant="ghost" size="sm">
              가이드
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              로그인
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm">시작하기</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            셀프서비스
            <br />
            LLM API 플랫폼
          </h2>
          <p className="text-lg text-muted-foreground">
            회원가입하고 5분 안에 API 키를 발급받아 사용하세요.
            <br />
            로컬 Ollama 연결로 무제한 사용도 가능합니다.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/auth/signup">
              <Button size="lg">무료로 시작하기</Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline">
                가이드 보기
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid w-full max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
            <Zap className="h-8 w-8" />
            <h3 className="font-semibold">빠른 시작</h3>
            <p className="text-center text-sm text-muted-foreground">
              5분 안에 가입부터 API 호출까지
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
            <Key className="h-8 w-8" />
            <h3 className="font-semibold">API 키 관리</h3>
            <p className="text-center text-sm text-muted-foreground">
              최대 3개 키, 키별 사용량 추적
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
            <BarChart3 className="h-8 w-8" />
            <h3 className="font-semibold">사용량 모니터링</h3>
            <p className="text-center text-sm text-muted-foreground">
              실시간 대시보드로 사용량 확인
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
            <Server className="h-8 w-8" />
            <h3 className="font-semibold">Ollama 연결</h3>
            <p className="text-center text-sm text-muted-foreground">
              자신의 GPU로 무제한 사용
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex h-14 items-center justify-center border-t text-sm text-muted-foreground">
        OpenLLM Platform
      </footer>
    </div>
  );
}
