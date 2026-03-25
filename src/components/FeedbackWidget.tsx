'use client'

import { useState } from 'react'
import { MessageCircle, X, Send, CheckCircle, Bug, Handshake } from 'lucide-react'

type FeedbackType = 'feedback' | 'bug' | 'partnership'

const TYPES: { id: FeedbackType; emoji: string; zh: string }[] = [
  { id: 'feedback', emoji: '💬', zh: '意见' },
  { id: 'bug', emoji: '🐛', zh: 'Bug' },
  { id: 'partnership', emoji: '🤝', zh: '合作' },
]

const PLACEHOLDERS: Record<FeedbackType, string> = {
  feedback: '有什么想法或建议？',
  bug: '描述一下你遇到的问题…',
  partnership: '介绍一下你的合作意向，留下联系方式我们会尽快回复 😊',
}

const HEADER_LABELS: Record<FeedbackType, string> = {
  feedback: '💬 意见反馈',
  bug: '🐛 报告 Bug',
  partnership: '🤝 寻求合作',
}

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>('feedback')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async () => {
    if (!message.trim()) return
    setSubmitting(true)
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        message,
        email: email || null,
        page: typeof window !== 'undefined' ? window.location.pathname : null,
      }),
    }).catch(() => {})
    setSubmitting(false)
    setDone(true)
    setTimeout(() => { setOpen(false); setDone(false); setMessage(''); setEmail('') }, 2500)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-orange-500">
            <span className="text-white font-semibold text-sm">
              {HEADER_LABELS[type]}
            </span>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {done ? (
            <div className="p-6 text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-gray-700 font-medium text-sm">
                {type === 'partnership' ? '收到了！我们会尽快联系你 🙌' : '收到了，谢谢！'}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {/* Type toggle */}
              <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
                {TYPES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={`flex-1 py-2 font-medium transition-colors ${type === t.id ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                  >
                    {t.emoji} {t.zh}
                  </button>
                ))}
              </div>

              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={PLACEHOLDERS[type]}
                rows={type === 'partnership' ? 5 : 4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 resize-none"
              />

              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={type === 'partnership' ? '邮箱（必填，方便我们联系你）' : '邮箱（可选，方便我们回复你）'}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400"
              />

              <button
                onClick={submit}
                disabled={!message.trim() || (type === 'partnership' && !email.trim()) || submitting}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? '发送中…' : '发送'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-12 h-12 bg-orange-500 hover:bg-orange-400 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        title="反馈 / Feedback"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </div>
  )
}
