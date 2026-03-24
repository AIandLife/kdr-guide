import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function translateText(text: string): Promise<string> {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Translate the following Chinese text to natural Australian English. Keep proper nouns (suburb names, council names, brand names) unchanged. Return ONLY the translated text, no explanation.\n\n${text}`,
    }],
  })
  return (msg.content[0] as { type: string; text: string }).text.trim()
}

export async function POST(req: Request) {
  try {
    const { postId, replyId } = await req.json()

    if (postId) {
      const { data: post } = await supabase
        .from('forum_posts')
        .select('title, body, title_en, body_en')
        .eq('id', postId)
        .single()

      if (!post) return Response.json({ error: 'Post not found' }, { status: 404 })
      if (post.title_en && post.body_en) return Response.json({ cached: true })

      const [title_en, body_en] = await Promise.all([
        translateText(post.title),
        translateText(post.body),
      ])

      await supabase
        .from('forum_posts')
        .update({ title_en, body_en, translated_at: new Date().toISOString() })
        .eq('id', postId)

      return Response.json({ title_en, body_en })
    }

    if (replyId) {
      const { data: reply } = await supabase
        .from('forum_replies')
        .select('body, body_en')
        .eq('id', replyId)
        .single()

      if (!reply) return Response.json({ error: 'Reply not found' }, { status: 404 })
      if (reply.body_en) return Response.json({ cached: true })

      const body_en = await translateText(reply.body)

      await supabase
        .from('forum_replies')
        .update({ body_en, translated_at: new Date().toISOString() })
        .eq('id', replyId)

      return Response.json({ body_en })
    }

    return Response.json({ error: 'postId or replyId required' }, { status: 400 })
  } catch (err) {
    console.error('Translation error:', err)
    return Response.json({ error: 'Translation failed' }, { status: 500 })
  }
}
