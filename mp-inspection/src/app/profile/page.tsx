'use client'

import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout'
import { Card, CardContent, Button, Badge } from '@/components/ui'
import { useAuthStore } from '@/store/auth'
import {
  User,
  Mail,
  Shield,
  Award,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  Info,
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark')
    setIsDark(!isDark)
    localStorage.setItem('theme', isDark ? 'light' : 'dark')
  }

  const roleLabels: Record<string, string> = {
    operator: 'Operator',
    qc: 'QC / Systeemman',
    admin: 'Beheerder',
  }

  return (
    <div className="min-h-screen">
      <Header title="Profiel" />

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* User info */}
        <Card variant="elevated" padding="lg">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user?.name || 'Geen naam'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      user?.role === 'admin'
                        ? 'danger'
                        : user?.role === 'qc'
                          ? 'warning'
                          : 'info'
                    }
                  >
                    {roleLabels[user?.role || 'operator']}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card variant="bordered" padding="none">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="flex items-center gap-4 p-4">
              <Mail className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">E-mail</div>
                <div className="text-gray-900 dark:text-white">{user?.email || '-'}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4">
              <Award className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Certificeringsniveau
                </div>
                <div className="text-gray-900 dark:text-white">
                  {user?.certification_level || 'Niet ingesteld'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4">
              <Shield className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 dark:text-white">
                    {user?.is_active ? 'Actief' : 'Inactief'}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      user?.is_active ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Settings */}
        <Card variant="bordered" padding="none">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-4 p-4 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-400" />
              )}
              <div className="flex-1">
                <div className="text-gray-900 dark:text-white">Donker thema</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {isDark ? 'Aan' : 'Uit'}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="flex items-center gap-4 p-4 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Info className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="text-gray-900 dark:text-white">Over deze app</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Versie 1.0.0
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </Card>

        {/* Logout */}
        <Button
          variant="danger"
          size="lg"
          className="w-full"
          onClick={handleLogout}
          leftIcon={<LogOut className="w-5 h-5" />}
        >
          Uitloggen
        </Button>
      </div>
    </div>
  )
}
