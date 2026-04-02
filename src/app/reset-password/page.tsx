'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/language-context'

export default function ResetPasswordPage() {
  const { lang } = useLang()
  const isZh = lang === 'zh'

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError(isZh ? '密码至少需要 6 个字符' : 'Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError(isZh ? '两次密码不一致' : 'Passwords do not match')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/logo-icon.png" alt="AusBuildCircle" width={40} height={40} className="rounded-xl" />
            <span className="font-bold text-xl text-gray-900">AusBuildCircle</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {isZh ? '设置新密码' : 'Set new password'}
          </h1>
          <p className="text-sm text-gray-500">
            {isZh ? '请输入你的新密码' : 'Enter your new password below'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="font-semibold text-gray-900 mb-1">
                {isZh ? '密码已更新！' : 'Password updated!'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {isZh ? '你现在可以用新密码登录了。' : 'You can now log in with your new password.'}
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 rounded-xl text-white font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}
              >
                {isZh ? '返回首页' : 'Go to homepage'}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isZh ? '新密码（至少 6 位）' : 'New password (min 6 characters)'}
                  required
                  minLength={6}
                  className={`${inputClass} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isZh ? '确认新密码' : 'Confirm new password'}
                  required
                  minLength={6}
                  className={`${inputClass} pl-10`}
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isZh ? '更新密码' : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
