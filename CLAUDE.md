# 澳洲建房圈 (AusBuildCircle) — 项目快速上手

## 这是什么
面向澳洲华人的推倒重建(KDR)/翻新改造平台。核心功能：AI 可行性报告、专业人士目录、论坛社区。

- **线上地址**: https://ausbuildcircle.com
- **GitHub**: https://github.com/AIandLife/kdr-guide
- **技术栈**: Next.js 15 · Tailwind CSS · Supabase · Claude Haiku API · Stripe · Resend

---

## 关键业务逻辑

### 专业人士双表写入
`/api/join` 注册时必须同时写入：
1. `kdr_professional_applications`（申请记录）
2. `professionals`（展示用主表）

Stripe 支付成功后，`/api/stripe/webhook` 把 `verified: true` + `verification_status: 'verified'` 写入 professionals 表，**即时生效，无需手动审核**。

### 询盘必须包含业主联系方式
`contact_requests` 表含 `homeowner_name`、`homeowner_email`、`homeowner_phone`。
`/api/contact` 会把业主联系方式发邮件给专业人士，确保对方能回复。

### 论坛翻译
帖子写入时用中文，切换到英文时 `/api/forum/translate` 后台翻译，写回 `title_en` / `body_en`。

---

## 数据库主要表

| 表 | 说明 |
|----|------|
| `professionals` | 专业人士展示主表（页面直接读这张） |
| `kdr_professional_applications` | 入驻申请记录 |
| `contact_requests` | 询盘（含业主姓名/邮箱/电话） |
| `forum_posts` | 论坛帖子（image_url, title_en, body_en） |
| `forum_replies` | 论坛回复 |
| `forum_reports` | 举报记录 |
| `site_feedback` | 全站反馈（feedback/bug/partnership） |
| `feasibility_interests` | 可行性邮件订阅 |
| `feasibility_reports` | AI 生成报告 |

Supabase Storage: `forum-images` bucket（公开，5MB 限制）

---

## 环境变量（Vercel 已配置，本地需 .env.local）

```
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY
ANTHROPIC_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ANNUAL
STRIPE_PRICE_MONTHLY
RESEND_API_KEY
RESEND_FROM_EMAIL          # noreply@ausbuildcircle.com
ADMIN_EMAIL                # recommendforterry@gmail.com
```

---

## 目录结构要点

```
src/
  app/
    api/               # 所有后端接口
    forum/             # 论坛页面 + NewPostModal
    professionals/     # 专业人士目录
    dashboard/pro      # 专业人士后台
    dashboard/homeowner
  components/
    FeedbackWidget.tsx # 全站右下角反馈悬浮按钮
    SiteNav.tsx
  lib/
    council-data.ts    # 全澳45+个council政策数据（核心数据）
    professionals-data.ts  # 静态备份专业人士数据
    supabase/          # client.ts + server.ts
    language-context.tsx
    auth-context.tsx
```

---

## 已知注意事项
- Vercel 免费套餐每天限100次部署，超了等UTC 00:00（AEDT 11:00）重置
- `professionals` 表有 `is_demo: true` 的8条示范数据，真实认证用户会排在前面
- 论坛城市筛选、分类标签、双语切换都在 `forum/page.tsx` 顶部常量定义
- Stripe key 曾因含不可见字符导致 ERR_INVALID_CHAR，已于2026-03-25换新key

---

## 待办（截至2026-03-25）
- [ ] 专业人士个人资料编辑页
- [ ] 免费试用期到期 cron job
- [ ] GoDaddy DNS：SPF + DMARC 记录（手动配置）
- [ ] 端到端测试 Stripe 支付 + Resend 邮件
