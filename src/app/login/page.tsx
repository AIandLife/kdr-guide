'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Globe, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/language-context'

type Tab = 'login' | 'register'

function LoginForm() {
  const { lang } = useLang()
  const isZh = lang === 'zh'
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'

  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newsletter, setNewsletter] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isWeChat, setIsWeChat] = useState(false)

  useEffect(() => {
    setIsWeChat(/MicroMessenger/i.test(navigator.userAgent))
  }, [])

  const supabase = createClient()

  const resetState = () => {
    setError('')
    setMessage('')
  }

  const switchTab = (t: Tab) => {
    setTab(t)
    resetState()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    resetState()

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      // Check if this might be a magic-link-only user
      if (error.message === 'Invalid login credentials') {
        setError(
          isZh
            ? '登录失败。如果你之前通过邮件链接登录，请点击下方「设置密码」。'
            : 'Invalid credentials. If you previously signed in via email link, click "Set password" below.'
        )
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    // Success — redirect
    window.location.href = next
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    resetState()

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

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    })

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        setError(
          isZh
            ? '该邮箱已注册。请切换到「登录」标签，或点击「忘记密码」重设。'
            : 'This email is already registered. Switch to "Login" tab, or use "Forgot password".'
        )
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    // Subscribe to newsletter
    if (newsletter) {
      fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'register' }),
      }).catch(() => {})
    }

    // Auto-confirm is enabled, so user is logged in immediately
    window.location.href = next
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError(isZh ? '请先输入邮箱地址' : 'Please enter your email first')
      return
    }
    setLoading(true)
    resetState()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage(
        isZh
          ? `密码重置链接已发送到 ${email}，请查收邮件。`
          : `Password reset link sent to ${email}. Check your email.`
      )
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    })
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
          <p className="text-sm text-gray-500">
            {isZh ? '保存你的查询记录，与专业人士保持联系' : 'Save your searches and stay connected with professionals'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                tab === 'login'
                  ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50/50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {isZh ? '登录' : 'Login'}
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                tab === 'register'
                  ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50/50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {isZh ? '注册' : 'Register'}
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* WeChat in-app browser notice */}
            {isWeChat ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                <Globe className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  {isZh ? '请在浏览器中打开' : 'Please open in a browser'}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {isZh
                    ? '当前为微信内置浏览器，Google 登录不支持此环境，请点击右上角「···」→ 在浏览器打开，再登录。'
                    : "WeChat's built-in browser doesn't support Google login. Tap ··· (top right) → Open in browser, then sign in."}
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  {isZh ? '邮箱密码登录在微信内可正常使用 ↓' : 'Email + password login works fine here ↓'}
                </p>
              </div>
            ) : (
              <>
                {/* Google */}
                <button
                  onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {isZh ? '使用 Google 登录' : 'Continue with Google'}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">
                    {isZh ? '或用邮箱密码' : 'or use email'}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              </>
            )}

            {/* Login form */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isZh ? '邮箱地址' : 'Email address'}
                    required
                    className={`${inputClass} pl-10`}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isZh ? '密码' : 'Password'}
                    required
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

                {error && <p className="text-xs text-red-500">{error}</p>}
                {message && <p className="text-xs text-green-600">{message}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isZh ? '登录' : 'Log in'}
                </button>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    {isZh ? '忘记密码？' : 'Forgot password?'}
                  </button>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {isZh ? '之前用邮件链接登录？设置密码' : 'Used email link before? Set password'}
                  </button>
                </div>
              </form>
            )}

            {/* Register form */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isZh ? '邮箱地址' : 'Email address'}
                    required
                    className={`${inputClass} pl-10`}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isZh ? '密码（至少 6 位）' : 'Password (min 6 characters)'}
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
                    placeholder={isZh ? '确认密码' : 'Confirm password'}
                    required
                    minLength={6}
                    className={`${inputClass} pl-10`}
                  />
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    className="mt-0.5 accent-orange-500 w-4 h-4 shrink-0"
                  />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    {isZh
                      ? '订阅我们的 Newsletter，获取建房资讯和活动通知（随时可取消）'
                      : 'Subscribe to our newsletter for building tips and event updates (unsubscribe anytime)'}
                  </span>
                </label>

                {error && <p className="text-xs text-red-500">{error}</p>}
                {message && <p className="text-xs text-green-600">{message}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isZh ? '注册' : 'Create account'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          {isZh ? (
            <>
              登录即代表你同意我们的
              <a href="/terms" className="underline hover:text-gray-300">服务条款</a>和
              <a href="/privacy" className="underline hover:text-gray-300">隐私政策</a>。
            </>
          ) : (
            <>
              By signing in you agree to our{' '}
              <a href="/terms" className="underline hover:text-gray-300">terms</a> and{' '}
              <a href="/privacy" className="underline hover:text-gray-300">privacy policy</a>.
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
