import fs from 'fs';

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const today = new Date().toLocaleDateString('zh-TW', {
  timeZone: 'Asia/Taipei',
  year: 'numeric', month: '2-digit', day: '2-digit'
});

const prompt = `今天是 ${today}。請搜尋整理今日最新的 AI 產業與低軌衛星新聞。

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

  const response = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: { temperature: 0.3 }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API 錯誤 ${response.status}: ${err}`);
  }

  const data = await response.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  text = text.replace(/```json|```/g, '').trim();
  const s = text.indexOf('[');
  const e = text.lastIndexOf(']');
  if (s === -1 || e === -1) throw new Error('找不到 JSON 陣列');

  const news = JSON.parse(text.slice(s, e + 1));
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
