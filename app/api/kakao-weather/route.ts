import { NextResponse } from 'next/server';

// 날씨 정보를 가져오는 함수 (OpenWeatherMap API 호출)
async function getWeather(city: string) {
  const apiKey = process.env.NEXT_OPENWEATHERMAP_API_KEY;
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error(`OpenWeatherMap API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const weather_state = data.weather[0].description;
    const temp = data.main.temp;

    return { weather_state, temp };
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    console.log(
      'Request Body:',
      JSON.stringify(requestBody, null, 2)
    ); // 요청 데이터 로깅

    // 카카오 챗봇으로부터 받은 데이터 처리 (사용자 발화)
    const userMessage = requestBody.userRequest?.utterance || '';

    // API 로직 구현 (사용자 발화에 따라 다른 응답 생성)
    let responseMessage = `안녕하세요! ${userMessage} 라고 말씀하셨네요.`;

    if (userMessage.includes('날씨')) {
      const city = 'Seoul';

      // getWeather API 호출
      const weatherData = await getWeather(city);

      if (weatherData) {
        responseMessage = `${city}의 날씨는 ${weatherData.weather_state}이고, 현재 온도는 ${weatherData.temp}도입니다.`;
      } else {
        responseMessage = '날씨 정보를 가져오는 데 실패했습니다.';
      }
    }

    // 카카오 챗봇 응답 형식에 맞춰 JSON 생성
    const response = {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: responseMessage,
            },
          },
        ],
      },
    };

    console.log('Response Data:', JSON.stringify(response, null, 2)); // 응답 데이터 로깅
    return NextResponse.json(response, { status: 200 }); // 명시적으로 200 OK 설정
  } catch (error: any) {
    console.error('API Error:', error);

    const errorResponse = {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: '오류가 발생했습니다. 다시 시도해주세요.',
            },
          },
        ],
      },
    };
    console.log(
      'Error Response Data:',
      JSON.stringify(errorResponse, null, 2)
    ); // 에러 응답 데이터 로깅
    return NextResponse.json(errorResponse, { status: 200 }); // 에러 발생 시에도 200 OK 반환
  }
}
