import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
  process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
)

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'Missing tender ID' }, { status: 400 })
    }

    // Fetch tender (select known columns first, then try detail_zh separately)
    const { data: tender, error } = await supabase
      .from('government_tenders')
      .select('id, atm_id, title, agency, category_name, close_date, atm_type, location, description_en, description_zh, link, guid, is_construction, published_at')
      .eq('id', id)
      .single()

    if (error || !tender) {
      return NextResponse.json({ error: 'Tender not found' }, { status: 404 })
    }

    // Try to check cached detail_zh (column may not exist yet)
    const { data: cached } = await supabase
      .from('government_tenders')
      .select('detail_zh')
      .eq('id', id)
      .single()

    if (cached?.detail_zh) {
      return NextResponse.json({ tender, detail_zh: cached.detail_zh })
    }

    // Generate Chinese analysis using Claude Haiku
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!.trim(),
    })

    const prompt = `你是一位澳洲政府招标分析专家。请根据以下招标信息，用中文为华人建筑行业从业者撰写一份详细分析。

招标标题: ${tender.title}
招标机构: ${tender.agency || '未指定'}
类别: ${tender.category_name || '未指定'}
招标类型: ${tender.atm_type || '未指定'}
地点: ${tender.location || '未指定'}
截止日期: ${tender.close_date || '未指定'}
发布日期: ${tender.published_at || '未指定'}

英文描述:
${tender.description_en || '无描述'}

请用以下格式输出（每个章节用 ## 标题）：

## 项目概述
（用通俗易懂的中文解释这个招标是什么，做什么项目，服务于什么目的）

## 具体要求
（从描述中提取具体的项目要求、工作范围、交付物等）

## 资质门槛
（根据招标内容推断可能需要的资质、经验、证书等。如果信息不足，说明一般此类招标通常需要什么）

## 预估规模
（如果能从描述中推断项目规模、预算范围，请说明。如果无法推断，给出此类项目的一般范围）

## 申请方式
（说明如何参与投标，通过什么渠道提交，需要准备什么材料）

## 关键时间节点
（截止日期、预计开工时间等关键时间点。如果信息有限，提醒关注截止日期）

注意：
- 面向华人建筑从业者，语言要专业但通俗
- 如果信息有限，诚实说明并给出合理推测
- 不要编造具体数字
- 保持分析客观实用`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const detail_zh =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // Cache the result back to DB (silently skip if column doesn't exist yet)
    const { error: updateError } = await supabase
      .from('government_tenders')
      .update({ detail_zh })
      .eq('id', id)
    if (updateError) {
      console.warn('Could not cache detail_zh:', updateError.message)
    }

    return NextResponse.json({ tender, detail_zh })
  } catch (e) {
    console.error('Tender detail error:', e)
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    )
  }
}
