import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold">사용 가이드</h1>
        <p className="mt-2 text-muted-foreground">
          OpenLLM API를 빠르게 시작하세요
        </p>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">1. 회원가입 및 API 키 발급</h3>
            <p className="text-sm text-muted-foreground">
              회원가입 후 대시보드에서 API 키를 발급받으세요. 최대 3개까지 생성할 수
              있습니다.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">2. API 호출</h3>
            <p className="text-sm text-muted-foreground">
              발급받은 키를 사용하여 OpenAI 호환 API를 호출하세요.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">3. 사용량 확인</h3>
            <p className="text-sm text-muted-foreground">
              대시보드에서 실시간 사용량을 확인할 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>코드 예제</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="python">
            <TabsList>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>

            <TabsContent value="python" className="mt-4">
              <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                <code>{`from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.yourdomain.com/v1"
)

response = client.chat.completions.create(
    model="llama3.2",
    messages=[
        {"role": "user", "content": "안녕하세요!"}
    ]
)

print(response.choices[0].message.content)`}</code>
              </pre>
            </TabsContent>

            <TabsContent value="javascript" className="mt-4">
              <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                <code>{`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-your-api-key",
  baseURL: "https://api.yourdomain.com/v1",
});

const response = await client.chat.completions.create({
  model: "llama3.2",
  messages: [
    { role: "user", content: "안녕하세요!" }
  ],
});

console.log(response.choices[0].message.content);`}</code>
              </pre>
            </TabsContent>

            <TabsContent value="curl" className="mt-4">
              <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                <code>{`curl https://api.yourdomain.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-your-api-key" \\
  -d '{
    "model": "llama3.2",
    "messages": [
      {"role": "user", "content": "안녕하세요!"}
    ]
  }'`}</code>
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* n8n Guide */}
      <Card>
        <CardHeader>
          <CardTitle>n8n 연동 가이드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h3 className="font-semibold">1. OpenAI 노드 추가</h3>
            <p className="text-sm text-muted-foreground">
              n8n 워크플로우에서 &quot;OpenAI&quot; 또는 &quot;HTTP Request&quot; 노드를 추가합니다.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">2. Credential 설정</h3>
            <p className="text-sm text-muted-foreground">
              OpenAI API Credential을 생성하고, API Key에 발급받은 키를 입력합니다.
              Base URL은{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                https://api.yourdomain.com/v1
              </code>
              으로 변경합니다.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">3. 모델 선택</h3>
            <p className="text-sm text-muted-foreground">
              모델명을 직접 입력합니다 (예: llama3.2, gemma2).
              &quot;Override model&quot; 옵션을 사용하세요.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Model List */}
      <Card>
        <CardHeader>
          <CardTitle>사용 가능한 모델</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">llama3.2</p>
                <p className="text-sm text-muted-foreground">
                  Meta Llama 3.2 - 범용 대화 모델
                </p>
              </div>
              <Badge>로컬</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">gemma2</p>
                <p className="text-sm text-muted-foreground">
                  Google Gemma 2 - 경량 모델
                </p>
              </div>
              <Badge>로컬</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">qwen2.5-coder</p>
                <p className="text-sm text-muted-foreground">
                  Alibaba Qwen 2.5 - 코딩 특화 모델
                </p>
              </div>
              <Badge>로컬</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              * 사용 가능한 모델은 서버 설정에 따라 다를 수 있습니다. Ollama 연결
              기능으로 자신의 모델을 추가할 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">
              Q: API 키를 분실했어요. 어떻게 하나요?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              보안상 이미 발급된 키는 다시 확인할 수 없습니다. 기존 키를 삭제하고
              새로 발급받아 주세요.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">
              Q: 할당량을 모두 사용했어요.
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              기본 할당량은 키당 5,000 토큰입니다. Ollama 연결 기능을 사용하면
              자신의 GPU로 무제한 사용이 가능합니다.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">
              Q: 429 Too Many Requests 에러가 발생합니다.
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              속도 제한에 걸린 경우입니다. 잠시 후 다시 시도해주세요. 기본
              제한은 분당 60회입니다.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">
              Q: 로컬 Ollama를 연결했는데 외부에서 접속이 안 됩니다.
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ollama 서버가 외부 접속을 허용하도록 OLLAMA_HOST=0.0.0.0 환경변수를
              설정하고, 방화벽에서 11434 포트를 열어주세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
