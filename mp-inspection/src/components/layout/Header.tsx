'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  title: string
  showBack?: boolean
  backHref?: string
  rightAction?: React.ReactNode
}

export function Header({ title, showBack = false, backHref, rightAction }: HeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 safe-area-top">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Terug"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h1>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  )
}
