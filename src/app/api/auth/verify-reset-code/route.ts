import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
)

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json()

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find the most recent unused, non-expired code for this email
    const { data: codeRecord, error: fetchError } = await supabase
      .from('password_reset_codes')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !codeRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired code. Please request a new one.' },
        { status: 400 }
      )
    }

    // Mark code as used
    await supabase
      .from('password_reset_codes')
      .update({ used: true })
      .eq('id', codeRecord.id)

    // Find user by email using admin API
    const { data: userList, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    if (listError) throw listError

    const user = userList.users.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    )

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email.' },
        { status: 404 }
      )
    }

    // Update user password via admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) throw updateError

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Verify reset code error:', e)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
