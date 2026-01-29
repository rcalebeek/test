'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { BottomNav } from './BottomNav'
import { useAuthStore } from '@/store/auth'
import { Loader2 } from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading, checkSession } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [checkSession])

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Laden...</p>
        </div>
      </div>
    )
  }

  // Hide bottom nav on certain pages
  const hideNav = pathname === '/login' || pathname.startsWith('/inspection/capture')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className={`${hideNav ? '' : 'pb-20'}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
