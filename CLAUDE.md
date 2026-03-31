# 澳洲建房圈 (AusBuildCircle) — 项目交接文档
> 最后更新：2026-03-31，由 Claude Sonnet 4.6 移交给下一个模型

---

## 一、项目基本信息

- **线上地址**: https://ausbuildcircle.com
- **GitHub**: https://github.com/AIandLife/kdr-guide
- **本地路径**: /Users/tianyuma/kdr-guide
- **技术栈**: Next.js 15 App Router · Tailwind CSS · Supabase · Claude Haiku API · Stripe (LIVE) · Resend
- **Supabase 项目 ref**: `nojfkmxcpdqzyrayvujv`
- **部署**: Vercel（自动部署，push main 即触发）
- **管理员邮箱**: recommendforterry@gmail.com

---

## 二、产品定位

面向澳洲华人的推倒重建(KDR)/翻新改造平台。三大核心功能：

1. **AI 可行性报告** — 输入地区/地块大小，生成 KDR/翻新可行性分析
2. **专业人士目录** — 建筑商、Town Planner、设计师等，可联系询盘
3. **建材供应商目录** — 建材商入驻、认证体系
4. 论坛社区（已上线，次要功能）

---

## 三、当前项目状态（2026-03-31）

### 已完成并上线
- AI 可行性报告（Edge Runtime 流式输出，带缓存）
- 专业人士目录 + 入驻流程 + Stripe 付款认证
- 建材供应商目录 + 入驻流程（2步，无强推销）
- 供应商后台 `/suppliers/account`（含隐藏的"增加商家可信度"认证入口）
- 业主后台 `/dashboard/homeowner`（显示联系过的专业人士+建材商）
- 专业人士后台 `/dashboard/pro`（含认证流程）
- 管理员后台 `/admin`（审核专业人士/供应商）
- 论坛（发帖/回复/举报/双语翻译）
- 安全 headers（X-Frame-Options, X-Content-Type-Options, Referrer-Policy）
- Sydney 39家建筑商 outreach 邮件已发送（2026-03-31）

### 最近一批修改（本次会话）
1. 删除测试垃圾数据 `naaticclcom` from `supplier_listings`
2. `/api/suppliers/list` 改为只返回 `unverified/verified`，不暴露 `status`/`reliability_score` 内部字段
3. `/suppliers/account` 加了 middleware 服务端保护（之前只有 client-side auth）
4. `next.config.ts` 加安全 headers
5. 供应商注册改为 2 步（去掉 Step 3 认证推销）
6. 注册成功页改为引导去建材目录/专业人士目录（不再引导去后台）
7. 供应商后台认证入口改为低调的"增加商家可信度"（不强推）
8. **AI 可行性报告截断 bug 修复**：根因是缓存流式格式不匹配，用 `fullJson.slice(1)` 修复；max_tokens 调整为 2500
9. 专业人士数据：7个大品牌替换为小公司
10. 供应商数据：17+大品牌删除，13个小供应商新增（共28个）
11. 页面标题：/login, /articles, /suppliers/register, /admin 加了 layout.tsx
12. 供应商 API 修复：`verified` 列不存在，改为从 `status` 派生

---

## 四、关键业务逻辑

### 专业人士流程
- 入驻：`/join` → `/api/join` → 写入 `kdr_professional_applications` + `professionals` 两张表
- 认证：`/dashboard/pro` → Stripe 付款 → webhook 自动设 `verified: true`（无需人工审核）
- 管理员也可手动 PATCH `/api/admin/professionals-list` 审核

### 供应商流程
- 入驻：`/suppliers/register`（2步）→ `/api/suppliers/register` → `supplier_listings` 表，status=`unverified`
- 注册完成后引导去目录，让他们"自然发现"别人有认证而自己没有
- 认证：进后台 `/suppliers/account` → 展开"增加商家可信度" → Stripe 付款 → webhook 设 `status=pending_review` + `paid_at` → Terry 后台点"通过" → `status=verified`
- **认证的设计哲学**：不主动推销，让用户在目录里看到对比后自己来问，Terry 再引导

### 业主流程
- 不需注册可浏览，联系专业人士/供应商需登录
- 未登录点联系 → 弹登录框 → 登录后通过 `?contact=slug` 或 `?enquire=supplierId` 自动回到原来的操作
- 联系记录保存 `homeowner_id`，显示在 `/dashboard/homeowner`

### Dashboard 路由逻辑
- 登录后检查邮箱是否在 `professionals` 表 → 是则跳 `/dashboard/pro`，否则跳 `/dashboard/homeowner`

---

## 五、数据库表

| 表 | 说明 |
|----|------|
| `professionals` | 专业人士展示主表（is_demo=true 的8条示范数据） |
| `kdr_professional_applications` | 入驻申请记录 |
| `contact_requests` | 业主→专业人士询盘（含 homeowner_id） |
| `supplier_listings` | 供应商主表（status: unverified/pending_review/verified；paid_at, verified_at, admin_notes 字段） |
| `supplier_inquiries` | 业主→供应商询价（含 homeowner_id） |
| `forum_posts` | 论坛帖子 |
| `forum_replies` | 论坛回复 |
| `suburb_feasibility_cache` | AI 报告缓存（90天有效期） |
| `feasibility_searches` | 搜索记录（无PII） |
| `feasibility_reports` | 已登录用户的完整报告 |
| `site_feedback` | 全站反馈 |

---

## 六、已知问题 & 待验证

### 已修复的 bug
- **AI 可行性报告截断**：根本原因是缓存流式格式与 AI 流式格式不匹配（缓存发完整 JSON，前端多加了 `{`），已通过 `fullJson.slice(1)` 修复；max_tokens 调整为 2500
- **供应商 API `verified` 列不存在**：`supplier_listings` 表没有 `verified` 列，API 改为从 `status` 字段派生 `verified` boolean

### 待办
- [ ] Melbourne/Brisbane 建筑商 outreach 名单（Sydney 39家已发，等 Terry 决定时机）
- [ ] GoDaddy DNS：SPF + DMARC 记录（手动配置，需 Terry 操作）
- [ ] Stripe webhook 端到端测试（生产环境付款全流程）

---

## 七、Sonnet 犯过的错误（后继模型不要重犯）

### 1. AI 报告截断反复出现（最严重）
**错误**：多次"修复"但问题反复出现。根本原因一直没找准——每次只加 JSON repair 逻辑，没有解决响应太长超时的根本问题。后来还自作主张加了 `additionalCosts`（7个子字段），让响应更长、问题更严重。
**教训**：Edge Runtime 有 25秒限制。AI 生成的 token 数直接决定耗时。不要在 prompt 里加大段新字段，要先估算 token 数。

### 2. 功能过度（Over-engineering）
**错误**：用户没要求的情况下，自己加了 `additionalCosts` 细项、在注册流程加了第3步认证推销、在成功页加了多余按钮。
**教训**：严格按用户要求做，不要"顺手"加觉得有用的功能。每加一个字段都要考虑对系统的影响。

### 3. 没有真正理解用户意图就动手
**错误**：用户说"认证应该是被发现的过程"，Sonnet 理解后把认证模块整个删掉了，然后用户说"不对，要保留但要低调"——来回改了两次。
**教训**：用户讲产品逻辑时，先完整确认理解再动手。

### 4. 部署前未做端到端验证
**错误**：多次部署后才发现问题（数据库缺列、API filter 逻辑错误、前端字段不匹配）。
**教训**：每次修改 API 的输出字段，必须同时检查所有消费方（前端 interface、其他 API）。

### 5. 数据库列缺失问题
**错误**：admin approve supplier 接口返回错误，原因是 `admin_notes` 和 `verified_at` 列不存在。这本来应该在开发时就建好。
**教训**：新功能涉及 DB 写入时，先确认所有字段都已建好。

---

## 八、环境变量

```
NEXT_PUBLIC_SUPABASE_URL=https://nojfkmxcpdqzyrayvujv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=（见 .env.local）
NEXT_PUBLIC_SUPABASE_ANON_KEY=（见 .env.local）
ANTHROPIC_API_KEY=（见 .env.local）
STRIPE_SECRET_KEY=（LIVE key，见 .env.local）
STRIPE_WEBHOOK_SECRET=（见 .env.local）
STRIPE_PRICE_ANNUAL=（见 .env.local）
RESEND_API_KEY=re_4sLEuiVf_6tJF1PAZzyoC2ng1WPwauQTM
RESEND_FROM_EMAIL=noreply@ausbuildcircle.com
ADMIN_EMAIL=recommendforterry@gmail.com
```

所有 key 读取时必须 `.trim()`（Vercel env var 可能含 `\n`）。

---

## 九、注意事项

- Vercel 免费套餐每天限 100 次部署，超了等 AEDT 11:00 重置
- Stripe 是 LIVE 模式，不是 test 模式，真实收费
- `professionals` 表有 `is_demo: true` 的 8 条示范数据
- 静态专业人士数据备份在 `src/lib/professionals-data.ts`
- outreach 脚本在 `outreach/send-outreach.js`，log 在 `outreach/outreach-log.csv`
- 微信内置浏览器不支持 Google OAuth，已有检测提示
- 每次改文件前必须先 Read，Grep 全局确认所有引用位置
- 始终用中文回复 Terry
