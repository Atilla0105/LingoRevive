import { NextResponse } from 'next/server';
import { TranslationRecord } from '@/lib/types';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { records, provider = 'openai', apiKey } = await req.json() as { records: TranslationRecord[], provider?: string, apiKey?: string };

    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'No records provided' }, { status: 400 });
    }

    // Filter out duplicates in case the client sent multiples
    const uniqueRecordsMap = new Map();
    records.forEach(r => uniqueRecordsMap.set(r.original, r));
    const uniqueRecords = Array.from(uniqueRecordsMap.values()) as TranslationRecord[];

    const dataToAnalyze = uniqueRecords.map(r => `- ${r.original} -> ${r.translation}`).join('\n');

    if (!apiKey) {
      // Return a simulated report if no API key is present
      return NextResponse.json({ 
        report: `## 🏆 专属学习总结（模拟版）

你今天成功掌握了 **${uniqueRecords.length}** 个全新短语！

下面是你今天复习内容的智能解析：

### 1. 📝 今日核心句子
${uniqueRecords.map(r => `* **${r.original}**\n  *地道释义:* ${r.translation}`).join('\n')}

### 2. 🌍 真实使用场景解析
*   这些短语在**日常见面打招呼**以及**和老朋友寒暄**时极为常见。
*   你可以尝试用 *"How's it going?"* 来代替教科书里的 *"How are you?"*，听起来会倍感亲切与地道。

### 3. 🤔 核心发音与词汇拆解
*   **"Swamped"**: 这是一个极好的高频母语词汇，原意是“被沼泽淹没”，在这里引申为“忙得不可开交、事情多得全压在身上”。比单纯用 "very busy" 生动得多。
*   **现在完成进行时** (*"have you been up to"*): 这个结构体现了从过去延续到此刻的一种状态，非常适合用于老朋友见面时聊“最近在忙些什么”。

---
> [!NOTE] 
> *温馨提示：当前显示为模拟排版报告。当您在服务端配置好 \`OPENAI_API_KEY\` 后，AI将根据您真实的查词记录，实时为您深度解析每一个句子！*`
      });
    }

    const systemPrompt = `你是一位资深的雅思口语考官兼母语级外教。用户将提供一组他们今天翻译或复习的句子（格式为："中文 -> 地道英文"）。
请使用 Markdown 格式生成一份生动活泼、排版精美且富有鼓励性的**中文每日学习报告**。
报告需要包含以下板块：
1. 简短的鼓励开场，指出他们学了几个句子。
2. "🌍 真实使用场景解析": 详细列举1-2个真实的海外社交或生活场景，说明如何自然地使用这些句子。
3. "🤔 核心发音与词汇拆解": 挑选这几个句子中1-3个极具"老外感"的词汇或连读、语法亮点进行通俗易懂的母语级解析。`;

    let reportContent = '';

    switch (provider) {
      case 'openai':
      case 'deepseek': {
        const baseUrl = provider === 'deepseek' ? 'https://api.deepseek.com/chat/completions' : 'https://api.openai.com/v1/chat/completions';
        const modelName = provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: dataToAnalyze },
            ],
          }),
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`${provider} API error: ${errText}`);
        }
        const data = await response.json();
        reportContent = data.choices[0].message.content;
        break;
      }

      case 'gemini': {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: systemPrompt + "\n\nData:\n" + dataToAnalyze }] }
            ]
          })
        });
        if (!geminiRes.ok) {
          const errText = await geminiRes.text();
          throw new Error(`Gemini API error: ${errText}`);
        }
        const geminiData = await geminiRes.json();
        reportContent = geminiData.candidates[0].content.parts[0].text;
        break;
      }

      case 'claude': {
        const claudeUrl = 'https://api.anthropic.com/v1/messages';
        const claudeRes = await fetch(claudeUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20240620',
            system: systemPrompt,
            messages: [{ role: 'user', content: dataToAnalyze }],
            max_tokens: 1500
          })
        });
        if (!claudeRes.ok) {
          const errText = await claudeRes.text();
          throw new Error(`Claude API error: ${errText}`);
        }
        const claudeData = await claudeRes.json();
        reportContent = claudeData.content[0].text;
        break;
      }
    }

    return NextResponse.json({ report: reportContent });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
