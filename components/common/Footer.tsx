"use client"

import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* 브랜드 섹션 */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">V-Hub</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              봉사 활동의 가치를 실시간 데이터로 증명하고 시각화하는 임팩트 관리 플랫폼
            </p>
          </div>

          {/* 링크 섹션 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">메뉴</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  대시보드
                </Link>
              </li>
              <li>
                <Link
                  href="/programs"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  프로그램
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  공유 갤러리
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  프로필
                </Link>
              </li>
            </ul>
          </div>

          {/* 정보 섹션 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">정보</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  로그인
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  회원가입
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 저작권 */}
        <div className="mt-8 pt-8 border-t">
          <p className="text-xs text-center text-muted-foreground">
            © {currentYear} 각자. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

