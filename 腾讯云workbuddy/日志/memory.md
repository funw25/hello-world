# AI 早报自动化 · 执行记录

## 稳定做法（每次沿用）
- 日期一律 `date "+%Y-%m-%d %A"` 取，不靠记忆。
- 先跑 4 个角度搜索，再用 WebFetch 逐条抓 aiweekly / aitoolly / secondtalent / benchlm。
- **聚合站的"N 小时前"是收录时间，不是发布时间**。必须点进原文确认。2026-08-30 就抓到 vLLM v0.28.0 被误标为 48h 内（实际 8/26），整条丢弃。
- benchlm.ai/model-updates/releases/<月小写>-<年> 用来确认"当日是否真有新模型发布"，避免编造。
- **Git Bash 下 `python -c "...sys.path.insert('.')..."` 会被吃掉引号报错**。无 webhook 归档时改用临时 .py 文件（已写进 PIPELINE.md 已知坑）。
- config.json 里 webhook 一直是 PLACEHOLDER → 每次都跳过推送，只生成纯文本兜底版 + 归档 sheet.csv。

## 执行历史
- **2026-09-12（周六）** ✅ 成功。6 条：25 位菲尔兹奖得主联署《A Severe Misalignment of AI in Mathematics》（陶哲轩博客 9/11，含 2026 新科得主邓煜）、Claude Code plugin evals + CI 门禁（v2.1.269，6 种评分器，Δ 指标）、新墨西哥最高法院罚律师 $5000（AI 编造证人）、华为 Kirin 9050 Pro 随 Mate XT 2 商用（LogicFolding / Tao's Law，密度 +55%）、英国 ONS 7 月 GDP +0.4%（计算机编程 +3.5%，贡献 0.12pp）、GreyNoise 披露 AI agent 助攻击 PaperCut 拿下 395 组织（教育业 204 名受害者）。产出 md/html/纯文本/wecom 四份，sheet.csv 追加 6 行（累计 30 行）。未推送（webhook 占位）。
  - **benchlm 再次证伪"当日新模型"**：9 月最近一次发布是 9/10（SWE-2 / Cohere North Small Translate / DeepSeek V4.1 Flash / GPT-Live-1），9/11–9/12 无新模型 → 当天不写模型发布条目，改打学术/工具/安全。这条证伪流程每次都要跑。
  - **重复规避**：9/11 那期已写过 DeepSeek V4.1-Flash GA、HBM 涨价、燧原上市 +188%、OpenAI Agents API、Caltech Mathathon。今天全部避开；菲尔兹奖声明虽与 yesterdays 的 Mathathon 同主题，但属新事件（25 人联署），文中明确点出"升级"关系以区分。
  - 新信源验证：**aitoolly.com/ai-news/YYYY-MM-DD 质量不错**（18 条，按原始发布日期分列，不伪装成当天），适合快速扫 The Verge / OpenAI Blog / GitHub Trending 的一手条目；**secondtalent 9/12 的 pandaily「6TB 中国 LLM 中转日志泄露」未获独立验证**（pandaily 自述未核实），按"不写未证实内容"原则弃用。
  - **SCMP 付费墙文章（/plus/ 路径）WebFetch 只能拿到标题和发布时间**，正文拿不全，需要配 pandaily 等非付费源补细节；引用时只能确认"日期+标题"。
- **2026-09-11（周五）** ✅ 成功。6 条：Anthropic 四起 Claude 越界事故（481M 转录、82%/33%/31% 有害率、METR 八周调查）、OpenAI Agents API 公测（仅美国区、无 ZDR）、DeepSeek V4.1-Flash GA（552B MoE、KV cache 1/4 HBM）、HBM 短缺→国产芯片涨 20–50% + DDR5 年涨约 500%、燧原科技科创板首日开盘 +188%、OpenAI 退出 Caltech Mathathon。产出 md/html/纯文本/wecom 四份，sheet.csv 追加 6 行（累计 24 行）。未推送（webhook 占位）。
  - 新经验：**buildfastwithai.com 的"AI News Today"有 16 条但没有外部原文链接**，只能当线索目录，必须另找一手源。它的数字也不全对（把有害率写成"30–82%"，实际是三个模型各自的 82%/33%/31%），**以 aiweek.co 的 alert 页 + Anthropic 官方 alignment assessment 为准**。
  - **aiweekly.co/ai-news-today 是目前最好用的日更信源**：34 条，每条带原文 URL + 相对时间 + 事件日期，且区分"页面收录时间"和"事件日期"。优先抓它。
  - **secondtalent.com 的日期标注不可靠**（把 9/5–9/9 的旧条目混进"今日十大"），只能用它的原文链接（Pandaily / SCMP / Tech in Asia），日期要回原站确认。
  - 国产条目好用的中文源：新浪财经（finance.sina.com.cn，IPO/行情带精确日期）、新华财经 cnfin.com、腾讯新闻 news.qq.com（外媒中译，带日期）、IT之家。
  - `render_copy.py <md> -o <out>` 可生成分段（每段 ≤1100 字）的 wecom 版，与 --plain 版互补，建议每次都跑。
- **2026-08-31（周一）** ✅ 成功。6 条：OpenAI Astra(GPT-6?)演示流出、Anthropic 会话被 infostealer 劫持、华为云+瑞金 RuiPath 2.0、NPR/NewsGuard 75% 揭穿率、Caterpillar 1亿美元培训 11.8 万人、No AI Fridays。产出 md/html/纯文本/wecom 四份，sheet.csv 追加 6 行（累计 18 行数据）。未推送（webhook 占位）。
  - 新经验：**benchlm 显示 8/30-8/31 无任何新模型发布**（最近为 8/28 Hy4 preview / Ling 3.0 Flash Fin），因此当天不写模型发布条目——用 benchlm 做"当日有无新模型"的证伪很有效。
  - 丢弃项：商务部收紧中国远程 GPU 租用规则（原文 The Information 08-28，超 48h）；Tech in Asia 韩国免费 AI 计划（付费墙，抓不到原文，无法验证日期）。
  - **Tech in Asia 有付费墙，WebFetch 只返回导航页**，不能作为可验证信源；国产/亚洲动态改用 IT之家（ithome.com，带精确发布时间戳，很好用）+ Pandaily/SCMP。
  - 新增好用信源：aihotradar.com/digest（中文 AI 日报，按日归档，含国内/国外/模型情报/论文分区，适合快速定位当日中文条目）。
- **2026-08-30（周日）** ✅ 成功。6 条：Sony/Warner 诉 Anthropic、OpenAI 11/12 断供 Cursor、Debian 生成式 AI 投票、Lemmalog、长鑫存储 CXMT、皮尤 AI 民调+数据中心。产出 md/html/纯文本/wecom 四份，sheet.csv 追加 6 行（累计 12 行数据）。未推送（webhook 占位）。
- 2026-08-29（周六）首期，主题：腾讯 Hy4 Preview、智谱 GLM-5.3-Flash、Anthropic 自我改进、Google AI Overviews、开放权重收购潮、Agent 抵抗关机。

## 待用户处理
配置企业微信 webhook 才能自动推送：`python push.py --save-webhook "<webhook地址>"`。
