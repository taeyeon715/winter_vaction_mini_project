/**
 * Phase 1 구현 검증 스크립트
 * 
 * 이 스크립트는 Phase 1 구현이 올바르게 되었는지 검증합니다.
 * 실행: pnpm tsx scripts/test-phase1.ts
 */

import { existsSync } from 'fs'
import { join } from 'path'

const PROJECT_ROOT = process.cwd()

interface TestResult {
  name: string
  passed: boolean
  message?: string
}

const results: TestResult[] = []

function test(name: string, testFn: () => boolean | string): void {
  try {
    const result = testFn()
    if (typeof result === 'boolean') {
      results.push({ name, passed: result })
    } else {
      results.push({ name, passed: false, message: result })
    }
  } catch (error: any) {
    results.push({ name, passed: false, message: error.message })
  }
}

console.log('🧪 Phase 1 구현 검증 시작...\n')

// 1. 파일 존재 확인
test('lib/supabase/env.ts 파일 존재', () => {
  return existsSync(join(PROJECT_ROOT, 'lib/supabase/env.ts'))
})

test('lib/supabase/client.ts 파일 존재', () => {
  return existsSync(join(PROJECT_ROOT, 'lib/supabase/client.ts'))
})

test('lib/supabase/server.ts 파일 존재', () => {
  return existsSync(join(PROJECT_ROOT, 'lib/supabase/server.ts'))
})

test('lib/supabase/storage.ts 파일 존재', () => {
  return existsSync(join(PROJECT_ROOT, 'lib/supabase/storage.ts'))
})

test('lib/auth-context.tsx 파일 존재', () => {
  return existsSync(join(PROJECT_ROOT, 'lib/auth-context.tsx'))
})

test('app/(dashboard)/profile/page.tsx 파일 존재', () => {
  return existsSync(join(PROJECT_ROOT, 'app/(dashboard)/profile/page.tsx'))
})

// 2. 환경 변수 확인
test('환경 변수 파일 존재', () => {
  return existsSync(join(PROJECT_ROOT, '.env.local'))
})

// 3. 패키지 확인
test('@supabase/supabase-js 패키지 설치 확인', () => {
  const packageJson = require(join(PROJECT_ROOT, 'package.json'))
  return !!packageJson.dependencies['@supabase/supabase-js']
})

test('@supabase/ssr 패키지 설치 확인', () => {
  const packageJson = require(join(PROJECT_ROOT, 'package.json'))
  return !!packageJson.dependencies['@supabase/ssr']
})

// 결과 출력
console.log('\n📊 검증 결과:\n')
let passedCount = 0
let failedCount = 0

results.forEach((result) => {
  const icon = result.passed ? '✅' : '❌'
  console.log(`${icon} ${result.name}`)
  if (result.message) {
    console.log(`   └─ ${result.message}`)
  }
  if (result.passed) {
    passedCount++
  } else {
    failedCount++
  }
})

console.log(`\n📈 통계: ${passedCount}개 통과, ${failedCount}개 실패\n`)

if (failedCount === 0) {
  console.log('🎉 모든 검증이 통과했습니다!')
  process.exit(0)
} else {
  console.log('⚠️  일부 검증이 실패했습니다. 위의 결과를 확인하세요.')
  process.exit(1)
}
