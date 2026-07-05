import pg from 'pg';

const { Pool } = pg;
const connectionString =
  process.env.DATABASE_URL ||
  'postgres://claude_clearance:claude_clearance_dev@127.0.0.1:55432/claude_clearance';

const pool = new Pool({ connectionString });

const poolMessages = [
  ['时区猎手', '刚测完 82 分，原来是系统时区暴露得太明显了 😂'],
  ['路由观察员', '我这边换了出口节点以后掉到 26 分，WebRTC 也要一起关。'],
  ['匿名访客', '这个通关矩阵比单纯 IP 检测清楚，知道问题出在哪。👍'],
  ['ProxyCat', 'curl 接口很适合放到线路巡检脚本里，返回文本也挺好看。'],
  ['小灰灰', '建议后面加一个 DNS 泄漏检测，我怀疑很多人挂在这里。'],
  ['Claude 玩家', '我喜欢这个留言区，可以收集大家的通关经验。✨'],
  ['边界测试员', '中文字体这一项挺真实，浏览器环境比想象中更容易暴露。'],
  ['一只老狗', '看到标题笑了，测完发现我确实很像中国地区老狗 🐶'],
  ['线路医生', '机场节点只看 IP 不够，ASN、时区、语言都要一起看。'],
  ['DevOps 路人', '本地优先这个设计是对的，检测结果不应该上传。'],
  ['北美出口', '美西节点 + 英文浏览器 + 非 UTC+8，目前是低风险。'],
  ['南洋节点', '新加坡出口不一定安全，浏览器语言还是 zh-CN 就会拉分。'],
  ['匿名工程师', '如果能导出一份检查报告给同事看就更方便了。'],
  ['Browser Guy', 'Canvas 字体探测这块挺妙，隐藏信号比 IP 更难意识到。'],
  ['AI 工程队', '我们准备把这个当作 Claude Code 环境验收前置项。🚦'],
  ['翻车记录员', '昨天只改代理没改系统时区，结果还是高风险。'],
  ['清醒一点', '这类工具应该把“估算”和“确定判定”分清楚，这里做得不错。'],
  ['日志控', '控制台信息可以再丰富点，最好展示版本、语言、API 状态。'],
  ['SEO 路人', '加 llms.txt 是个好方向，AI 搜索现在确实会读这种入口。'],
  ['GEO 玩家', '建议把 FAQ、检测维度、API endpoint 都喂给 AI 检索。'],
  ['安全边界', '留言区记得别存原始 IP，哈希就够了。'],
  ['本地党', 'Docker PG 跑在 55432 很舒服，不影响我本机 5432。'],
  ['前端同学', '页面视觉很干净，留言墙可以再做成讨论流。'],
  ['低风险样本', '语言、时区、字体都处理后，分数终于降下来了 🙌'],
  ['高风险样本', '我这机器全中文环境，高风险一点不冤。'],
  ['中转观察', 'hostname 也可能是风险点，最好别用太直白的中转域名。'],
  ['匿名研究员', '能不能后续加一项代理域名关键词自查？'],
  ['产品经理', '这个站的定位很明确：不是吓人，是告诉你哪里暴露。'],
  ['灰度测试', '访问统计做防刷是必要的，不然刷新几下数据就废了。'],
  ['终端党', 'curl 默认返回文本报告很友好，JSON 也保留了。'],
  ['QA 同学', '建议留言提交后前端立即刷新列表，体验会更顺。'],
  ['夜间访客', '半夜测环境，发现浏览器语言列表第一位还是中文 😅'],
  ['Cloud Runner', '部署到 Vercel 时记得换真实 DATABASE_URL。'],
  ['线路收藏家', '不同节点差异很大，可以考虑以后做排行榜。'],
  ['AI SEO', '结构化数据 + FAQ + sitemap + llms.txt，这套 GEO 基线够用了。'],
  ['开心路人', '我只是来看狗头文案的，结果认真测了一遍 🐾'],
  ['LocalFirst', '本地检测、服务端只做留言和统计，这个边界清楚。'],
  ['独立开发者', '这个项目可以当成小型 Astro + PG 模板参考。'],
  ['Risk Mapper', '希望后续每条风险都能展开解释和修复步骤。'],
  ['匿名用户 404', '我刷新很多次访问数没狂涨，防刷窗口生效就好。'],
  ['PG 爱好者', '留言落 PostgreSQL 后，后续做审核和搜索都方便。'],
  ['开源观察', '记得 README 里把本地数据库启动流程写清楚。'],
  ['机场体验官', '同一个出口 IP，不同浏览器环境分数差很多。'],
  ['信号噪声', '弱信号不要过度解释，页面里标注权重很有帮助。'],
  ['Prompt 检测员', '公开逆向信息要写清来源边界，避免用户误解成官方判定。'],
  ['Emoji 测试', '留言支持 Emoji 很好，来一个压力测试：🚀🔥✅🐶'],
  ['普通访客', '第一次看到把 Claude 环境风险做成社区讨论的。'],
  ['通关失败', '我 96 分，已经不用抢救了，直接换机器吧 🤣'],
  ['通关成功', '24 分，暂时安全，记录一下。'],
  ['最后一条', '希望这个留言墙以后能沉淀真实经验，而不是只看热闹。'],
];

const targetCount = Math.max(10, Math.min(50, Number(process.env.SEED_MESSAGE_COUNT || 32)));
const selected = [...poolMessages].sort(() => Math.random() - 0.5).slice(0, targetCount);

try {
  let inserted = 0;
  for (const [index, [author, content]] of selected.entries()) {
    const key = `demo-${author}-${index}`;
    const result = await pool.query(
      `INSERT INTO community_messages
        (seed_key, author_name, content, visitor_hash, source, created_at)
       VALUES ($1, $2, $3, 'seed-demo', 'seed', now() - ($4::int || ' minutes')::interval)
       ON CONFLICT (seed_key) DO NOTHING`,
      [key, author, content, selected.length - index],
    );
    inserted += result.rowCount || 0;
  }
  console.log(`DB_SEED_OK inserted=${inserted} requested=${targetCount}`);
} catch (error) {
  console.error('DB_SEED_FAILED');
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
