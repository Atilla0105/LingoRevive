import { NextResponse } from 'next/server';

// In a real app, you would use process.env.OPENAI_API_KEY
// For this MVP, we will simulate the AI response if the key is missing,
// or provide a simple proxy to an AI API.

export async function POST(req: Request) {
  try {
    const { text, provider = 'openai', apiKey } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const isChinese = /[\u4e00-\u9fa5]/.test(text.trim());
    const systemPrompt = isChinese 
      ? 'Translate the following Chinese text into naturally spoken, highly conversational everyday English. Avoid overly formal or textbook expressions. Provide ONLY the translation.'
      : 'Translate the following English text into authentic, everyday spoken Chinese. Provide ONLY the translation.';
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (!apiKey) {
      // Mock flow if no key is provided from client settings or env
      const textTrimmed = text.trim();
      let translation = "";
      
      const providerTags: Record<string, string> = {
        openai: "ChatGPT-4o",
        gemini: "Gemini 1.5 Pro",
        claude: "Claude 3.5 Sonnet",
        deepseek: "DeepSeek-V3"
      };
      
      const pTag = providerTags[provider] || "AI";

      if (isChinese) {
        const enMocks: Record<string, string> = {
          "你好": "Hey, how's it going?",
          "最近怎么样": "What have you been up to?",
          "我很忙": "I've been swamped lately."
        };
        translation = enMocks[textTrimmed] || `[⚠️ No Key available for ${pTag}] Simulated English: "${textTrimmed}"`;
      } else {
        const chMocks: Record<string, string> = {
          "hello": "你好",
          "how are you": "最近怎么样？",
          "busy": "很忙"
        };
        translation = chMocks[textTrimmed.toLowerCase()] || `[⚠️ 请在 Settings 添加 ${pTag} Key] 模拟中文: "${textTrimmed}"`;
      }
      
      return NextResponse.json({ 
        translation,
        providerUsed: provider,
        simulated: true
      });
    }

    // --- REAL API DISPATCHER ---
    let translationContent = '';
    
    switch (provider) {
      case 'openai':
      case 'deepseek': {
        const baseUrl = provider === 'deepseek' ? 'https://api.deepseek.com/chat/completions' : 'https://api.openai.com/v1/chat/completions';
        const modelName = provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o';
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text },
            ]
          }),
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`${provider} API error: ${errText}`);
        }
        const data = await response.json();
        translationContent = data.choices[0].message.content;
        break;
      }
        
      case 'gemini': {
         const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
         const geminiRes = await fetch(geminiUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             contents: [
               { role: "user", parts: [{ text: systemPrompt + "\n\nText: " + text }] }
             ]
           })
         });
         if (!geminiRes.ok) {
           const errText = await geminiRes.text();
           throw new Error(`Gemini API error: ${errText}`);
         }
         const geminiData = await geminiRes.json();
         translationContent = geminiData.candidates[0].content.parts[0].text;
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
             messages: [{ role: 'user', content: text }],
             max_tokens: 1024
           })
         });
         if (!claudeRes.ok) {
           const errText = await claudeRes.text();
           throw new Error(`Claude API error: ${errText}`);
         }
         const claudeData = await claudeRes.json();
         translationContent = claudeData.content[0].text;
         break;
      }
    }

    return NextResponse.json({ translation: translationContent, providerUsed: provider });

    // Done

  } catch (error) {
    return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
  }
}
