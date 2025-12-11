'use server';

export async function getChatResponse(
  messages: any[],
  prompt: string
) {
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_CHATGPT_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4-turbo',
            messages: [
              ...messages.map((m) => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text,
              })),
              { role: 'user', content: prompt },
            ],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          attempt++;
          await new Promise((r) => setTimeout(r, 2000 * attempt));
          continue;
        } else {
          throw new Error(`HTTP Error: ${response.status}`);
        }
      }

      const data = await response.json();
      return data;
    } catch (err) {
      if (attempt >= MAX_RETRIES - 1) throw err;
      attempt++;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  throw new Error('요청이 초과되었습니다.');
}
