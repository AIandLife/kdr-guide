import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token')
  if (!token) {
    return Response.redirect(new URL('/unsubscribe?status=invalid', req.url))
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ unsubscribed: true })
    .eq('unsubscribe_token', token)

  if (error) {
    return Response.redirect(new URL('/unsubscribe?status=error', req.url))
  }

  return Response.redirect(new URL('/unsubscribe?status=success', req.url))
}
