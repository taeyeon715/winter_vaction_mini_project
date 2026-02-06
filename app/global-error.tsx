"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 글로벌 에러 로깅
    console.error("글로벌 에러:", error)
  }, [error])

  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl">심각한 오류가 발생했습니다</CardTitle>
              <CardDescription className="mt-2">
                애플리케이션을 초기화할 수 없습니다. 페이지를 새로고침해 주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={reset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                페이지 새로고침
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
