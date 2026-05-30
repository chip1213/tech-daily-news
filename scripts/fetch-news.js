import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const today = new Date().toLocaleDateString('zh-TW', {
  timeZone: 'Asia/Taipei',
  year: 'numeric', month: '2-digit', day: '2-digit'
});

const prompt = `今天是 ${today}。請用網路搜尋，整理今日最新的 AI 產業與低軌衛星新聞。

請嚴格以 JSON 格式回傳，不要有任何其他文字：
[
  {
    "title": "新聞標題（15字以內，中文）",
    "summary": "新聞摘要（50-80字，中文，說明重點與影響）",
    "region": "tw 或 int",
    "topic": "ai 或 sat"
  }
]

要求：
- 台灣 AI: 2則、台灣低軌衛星: 3則（region=tw）
- 國際 AI: 3則、國際低軌衛星: 2則（region=int）
- 標題精簡有力，摘要客觀說明事實
- 必須是最近幾天內的新聞`;

async function main() {
  console.log(`[${new Date().toISOString()}] 開始抓取新聞...`);

  const response = await client.messages.create({
    model: 'claude-opus-4-5-20251101',
    max_tokens: 1500,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [{ role: 'user', content: prompt }]
  });

  let jsonText = '';
  for (const block of response.content) {
    if (block.type === 'text') jsonText += block.text;
  }

  jsonText = jsonText.replace(/```json|```/g, '').trim();
  const s = jsonText.indexOf('[');
  const e = jsonText.lastIndexOf(']');
  if (s === -1 || e === -1) throw new Error('找不到 JSON 陣列');

  const news = JSON.parse(jsonText.slice(s, e + 1));
  console.log(`取得 ${news.length} 則新聞`);

  const output = {
    fetchedAt: new Date().toISOString(),
    date: today,
    news
  };

  fs.writeFileSync('news.json', JSON.stringify(output, null, 2), 'utf-8');
  console.log('✓ news.json 已儲存');
}

main().catch(err => {
  console.error('❌ 錯誤:', err.message);
  process.exit(1);
});
