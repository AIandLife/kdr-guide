'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Building2, Mail, Loader2, KeyRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/language-context'

function LoginForm() {
  const { lang } = useLang()
  const isZh = lang === 'zh'
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    if (error) setError(error.message)
    else setStep('otp')
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: 'email',
    })
    if (error) {
      setError(isZh ? '验证码不正确或已过期，请重试' : 'Invalid or expired code. Please try again.')
    } else {
      router.push(next)
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-200">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">AusBuildCircle</span>
          </a>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {isZh ? '登录 / 注册' : 'Sign in'}
          </h1>
          <p className="text-sm text-gray-500">
            {isZh ? '保存你的查询记录，与专业人士保持联系' : 'Save your searches and stay connected with professionals'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          {step === 'email' ? (
            <>
              {/* Google */}
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isZh ? '使用 Google 登录' : 'Continue with Google'}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">{isZh ? '或用邮箱验证码' : 'or use email code'}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Email OTP step 1 */}
              <form onSubmit={handleSendOtp} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={isZh ? '你的邮箱地址' : 'your@email.com'}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {isZh ? '发送验证码' : 'Send code'}
                </button>
              </form>
            </>
          ) : (
            /* Email OTP step 2 — enter code */
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-6 h-6 text-orange-500" />
                </div>
                <p className="font-semibold text-gray-900 mb-1">
                  {isZh ? '输入验证码' : 'Enter your code'}
                </p>
                <p className="text-sm text-gray-500">
                  {isZh ? `已发送 6 位验证码到 ${email}` : `We sent a 6-digit code to ${email}`}
                </p>
              </div>
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 text-center text-xl tracking-widest font-mono"
                />
                {error && <p className="text-xs text-red-500 text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isZh ? '验证并登录' : 'Verify & sign in'}
                </button>
              </form>
              <button
                onClick={() => { setStep('email'); setOtp(''); setError('') }}
                className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isZh ? '← 重新输入邮箱' : '← Change email'}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          {isZh ? '登录即代表你同意我们的服务条款和隐私政策。' : 'By signing in you agree to our terms and privacy policy.'}
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
