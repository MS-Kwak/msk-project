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

// 현재 날씨 정보를 가져오는 API
export async function getWeather(request: Request) {
  // URL에서 query parameter로 받기
  const url = new URL(request.url);
  const city = url.searchParams.get('city') || 'Seoul'; // 기본값 Seoul

  const response = await fetch(
    `https://www.metaweather.com/api/location/search/?query=${encodeURIComponent(
      city
    )}`
  );

  if (!response.ok) {
    return new Response(JSON.stringify({ error: '도시 검색 실패' }), {
      status: 500,
    });
  }

  const locations = await response.json();
  if (locations.length === 0) {
    return new Response(JSON.stringify({ error: '해당 도시 없음' }), {
      status: 404,
    });
  }

  const woeid = locations[0].woeid; // 첫 검색 결과의 woeid 선택

  // 날씨 정보 요청
  const weatherRes = await fetch(
    `https://www.metaweather.com/api/location/${woeid}/`
  );
  if (!weatherRes.ok) {
    return new Response(JSON.stringify({ error: '날씨 정보 실패' }), {
      status: 500,
    });
  }

  const weatherData = await weatherRes.json();
  const todayWeather = weatherData.consolidated_weather[0];

  return new Response(
    JSON.stringify({
      weather_state: todayWeather.weather_state_name,
      temp: todayWeather.the_temp,
    }),
    { status: 200 }
  );
}
