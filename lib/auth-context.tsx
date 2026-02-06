"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { getSupabaseClient } from "./supabase/client";
import type { Profile } from "@/types/database";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'admin' | 'user';
  studentId?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  makeAdmin: () => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();

  // 프로필 로드 함수 (useCallback으로 메모이제이션)
  const loadProfile = useCallback(async (userId: string) => {
    const supabase = getSupabaseClient();
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // 프로필이 없으면 자동으로 생성
        if (error.code === 'PGRST116') {
          console.log('프로필이 없어서 자동 생성합니다.');
          const { data: { user: authUser } } = await supabase.auth.getUser();
          
          if (authUser) {
            const name = authUser.user_metadata?.name || authUser.email?.split('@')[0] || '사용자';
            
            // 프로필 생성
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: authUser.id,
                email: authUser.email || '',
                name: name,
                role: 'user',
              })
              .select()
              .single();

            if (createError) {
              console.error('프로필 생성 실패:', createError);
              // 프로필 생성 실패 시 기본 정보만 사용
              setUser({
                id: authUser.id,
                name: name,
                email: authUser.email || '',
                avatar: authUser.user_metadata?.avatar_url,
                role: 'user',
              });
              return;
            }

            if (newProfile) {
              setUser({
                id: newProfile.id,
                name: newProfile.name,
                email: newProfile.email,
                avatar: newProfile.avatar_url || undefined,
                role: newProfile.role,
                studentId: newProfile.student_id || null,
              });
              return;
            }
          }
        } else {
          console.error('프로필 로드 실패:', error);
          // 다른 에러인 경우 기본 정보만 사용
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            setUser({
              id: authUser.id,
              name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '사용자',
              email: authUser.email || '',
              avatar: authUser.user_metadata?.avatar_url,
              role: 'user',
            });
          }
        }
        return;
      }

      if (profile) {
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar_url || undefined,
          role: profile.role,
          studentId: profile.student_id,
        });
      }
    } catch (error) {
      console.error('프로필 로드 중 오류:', error);
    }
  }, []);

  // 초기 세션 확인 및 프로필 로드
  useEffect(() => {
    const supabase = getSupabaseClient();
    let mounted = true;

    async function loadSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          await loadProfile(session.user.id);
        }
      } catch (error) {
        console.error('세션 로드 실패:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('로그인 실패:', error);
        
        // 구체적인 에러 메시지 반환
        let errorMessage = "로그인에 실패했습니다.";
        if (error.message === "Invalid login credentials") {
          errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다. 계정이 없으시다면 회원가입을 먼저 진행해주세요.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.";
        } else {
          errorMessage = error.message || "로그인에 실패했습니다.";
        }
        
        return { success: false, error: errorMessage };
      }

      if (data.user) {
        await loadProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: "로그인에 실패했습니다." };
    } catch (error: any) {
      console.error('로그인 중 오류:', error);
      return { success: false, error: error.message || "로그인 중 오류가 발생했습니다." };
    }
  }, [loadProfile]);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        console.error('회원가입 실패:', error);
        
        // 구체적인 에러 메시지 반환
        let errorMessage = "회원가입에 실패했습니다.";
        if (error.message.includes("User already registered")) {
          errorMessage = "이미 등록된 이메일입니다. 로그인을 시도해주세요.";
        } else if (error.message.includes("Password")) {
          errorMessage = "비밀번호는 최소 6자 이상이어야 합니다.";
        } else {
          errorMessage = error.message || "회원가입에 실패했습니다.";
        }
        
        return { success: false, error: errorMessage };
      }

      // 회원가입 성공 시 프로필이 자동으로 생성되는지 확인
      // (seed.sql의 handle_new_user 트리거가 자동 생성)
      if (data.user) {
        // 프로필이 생성될 때까지 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: "회원가입에 실패했습니다." };
    } catch (error: any) {
      console.error('회원가입 중 오류:', error);
      return { success: false, error: error.message || "회원가입 중 오류가 발생했습니다." };
    }
  }, [loadProfile]);

  const logout = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    }
  }, []);

  // 관리자 권한 부여 함수 (개발용)
  const makeAdmin = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user?.id) {
        return { success: false, error: '로그인이 필요합니다.' };
      }

      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);

      if (error) {
        console.error('관리자 권한 부여 실패:', error);
        return { success: false, error: error.message || '관리자 권한 부여에 실패했습니다.' };
      }

      // 프로필 새로고침
      await loadProfile(user.id);
      return { success: true };
    } catch (error: any) {
      console.error('관리자 권한 부여 중 오류:', error);
      return { success: false, error: error.message || '관리자 권한 부여 중 오류가 발생했습니다.' };
    }
  }, [user?.id, loadProfile]);

  // 프로필 새로고침 함수
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await loadProfile(user.id);
    }
  }, [user?.id, loadProfile]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, makeAdmin, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
