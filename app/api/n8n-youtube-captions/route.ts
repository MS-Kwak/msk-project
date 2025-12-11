import { NextResponse } from 'next/server';

// MCP SDK imports - 이 패키지들은 먼저 설치되어야 합니다
// npm install @modelcontextprotocol/sdk
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

// CORS 헤더 설정 - 다양한 출처에서 API를 호출할 수 있도록 허용
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

// MCP 클라이언트를 생성하고 연결하는 함수
// 이 함수는 마치 전화를 걸어 상대방과 연결되는 과정을 담당합니다
async function createMCPClient(): Promise<Client> {
  try {
    console.log('MCP 클라이언트 연결을 시작합니다...');

    // 서버 URL 구성 - API 키를 포함하여 인증된 연결을 만듭니다
    const baseUrl = new URL(
      'https://server.smithery.ai/@jkawamoto/mcp-youtube-transcript/mcp'
    );
    baseUrl.searchParams.set(
      'api_key',
      '51bfd0bb-ee71-4116-ae67-06ff251a6cc9'
    );

    console.log(`연결할 서버 URL: ${baseUrl.toString()}`);

    // HTTP 전송 계층을 설정합니다 - URL 객체를 직접 전달합니다
    const transport = new StreamableHTTPClientTransport(baseUrl);

    // MCP 클라이언트 인스턴스를 생성합니다
    const client = new Client({
      name: 'Next.js YouTube Captions API',
      version: '1.0.0',
    });

    // 클라이언트를 서버에 연결합니다
    await client.connect(transport);
    console.log('MCP 클라이언트 연결이 성공했습니다.');

    return client;
  } catch (error) {
    console.error('MCP 클라이언트 생성 중 오류 발생:', error);
    throw new Error(
      `MCP 클라이언트 연결 실패: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`
    );
  }
}

// YouTube 자막을 가져오는 핵심 함수
// MCP를 통해 원격 서버의 도구를 호출하여 자막을 추출합니다
async function fetchYouTubeCaptionsViaMCP(
  client: Client,
  videoUrl: string
): Promise<string | null> {
  try {
    console.log(`YouTube 자막 추출을 시작합니다: ${videoUrl}`);

    // 사용 가능한 도구 목록을 먼저 확인합니다
    // 이는 마치 도구상자를 열어 어떤 도구들이 들어있는지 확인하는 과정입니다
    const tools = await client.listTools();
    console.log(
      `사용 가능한 도구들: ${tools.tools
        .map((t) => t.name)
        .join(', ')}`
    );

    // YouTube 자막 관련 도구를 찾습니다
    const transcriptTool = tools.tools.find(
      (tool) =>
        tool.name.toLowerCase().includes('transcript') ||
        tool.name.toLowerCase().includes('captions') ||
        tool.name.toLowerCase().includes('youtube')
    );

    if (!transcriptTool) {
      console.error('자막 추출 도구를 찾을 수 없습니다.');
      throw new Error('YouTube 자막 추출 도구를 사용할 수 없습니다.');
    }

    console.log(`사용할 도구: ${transcriptTool.name}`);

    // 도구를 실행하여 자막을 가져옵니다
    // 각 MCP 서버마다 파라미터 구조가 다를 수 있으므로 여러 형식을 시도합니다
    const possibleArguments = [
      { url: videoUrl },
      { video_url: videoUrl },
      { youtube_url: videoUrl },
      { video_id: extractVideoId(videoUrl) },
    ].filter((arg) => Object.values(arg).every((val) => val != null));

    let transcriptResult = null;
    let lastError = null;

    // 각각의 가능한 인수 형식을 순차적으로 시도합니다
    for (const args of possibleArguments) {
      try {
        console.log(
          `도구 실행 시도: ${transcriptTool.name}, 인수:`,
          args
        );

        const result = await client.callTool({
          name: transcriptTool.name,
          arguments: args,
        });

        if (
          result &&
          result.content &&
          Array.isArray(result.content) &&
          result.content.length > 0
        ) {
          console.log('자막 추출이 성공했습니다.');
          transcriptResult = result;
          break;
        }
      } catch (error) {
        console.log(
          `인수 ${JSON.stringify(args)}로 시도 실패:`,
          error
        );
        lastError = error;
        continue;
      }
    }

    if (!transcriptResult) {
      console.error('모든 시도가 실패했습니다.');
      throw lastError || new Error('자막을 가져올 수 없습니다.');
    }

    // 결과에서 텍스트 추출
    // MCP 응답 구조는 다양할 수 있으므로 여러 방법으로 텍스트를 찾아봅니다
    let extractedText = null;

    // 타입 가드를 사용하여 안전하게 content 배열에 접근합니다
    if (
      transcriptResult.content &&
      Array.isArray(transcriptResult.content)
    ) {
      for (const content of transcriptResult.content) {
        // content 객체의 구조를 안전하게 확인합니다
        if (
          content &&
          typeof content === 'object' &&
          'type' in content &&
          content.type === 'text' &&
          'text' in content &&
          typeof content.text === 'string'
        ) {
          extractedText = content.text;
          break;
        }
      }
    }

    if (!extractedText) {
      // 백업 방법: JSON 문자열에서 텍스트 추출 시도
      const resultString = JSON.stringify(transcriptResult);
      const textMatch = resultString.match(/"text":\s*"([^"]+)"/);
      if (textMatch) {
        extractedText = textMatch[1];
      }
    }

    console.log(
      `추출된 텍스트 길이: ${
        extractedText ? extractedText.length : 0
      }`
    );
    return extractedText;
  } catch (error) {
    console.error('MCP를 통한 자막 추출 중 오류:', error);
    throw error;
  }
}

// YouTube URL에서 비디오 ID를 추출하는 헬퍼 함수
function extractVideoId(url: string): string | null {
  try {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  } catch (error) {
    console.error('비디오 ID 추출 중 오류:', error);
    return null;
  }
}

// CORS preflight 요청을 처리합니다
// 이는 브라우저가 실제 요청을 보내기 전에 권한을 확인하는 과정입니다
export async function OPTIONS(request: Request) {
  console.log('CORS preflight 요청을 처리합니다.');
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: corsHeaders,
    }
  );
}

// 메인 POST 요청 처리 함수
// 이 함수가 n8n이나 다른 클라이언트로부터 요청을 받아 자막을 반환합니다
export async function POST(req: Request) {
  let mcpClient: Client | null = null;

  try {
    console.log('=== YouTube 자막 API 요청이 시작되었습니다 ===');

    // 요청 본문을 파싱합니다
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('요청 본문 파싱 성공:', requestBody);
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
      return NextResponse.json(
        {
          error:
            '잘못된 요청 형식입니다. JSON 형식으로 요청해주세요.',
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const youtubeUrl = requestBody?.url;

    // URL 유효성 검사
    const urlRegex =
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)$/;
    if (!youtubeUrl || !urlRegex.test(youtubeUrl)) {
      console.log('유효하지 않은 YouTube URL:', youtubeUrl);
      return NextResponse.json(
        { error: '유효한 YouTube URL을 입력해주세요.' },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // YouTube URL 형식 검증
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      console.log('유효하지 않은 YouTube URL:', youtubeUrl);
      return NextResponse.json(
        { error: '유효한 YouTube URL을 입력해주세요.' },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    console.log(`처리할 YouTube 비디오: ${videoId}`);

    // MCP 클라이언트 생성 및 연결
    try {
      mcpClient = await createMCPClient();
    } catch (error) {
      console.error('MCP 클라이언트 생성 실패:', error);
      return NextResponse.json(
        {
          error: 'MCP 서비스에 연결할 수 없습니다.',
          details:
            error instanceof Error
              ? error.message
              : '알 수 없는 오류',
        },
        {
          status: 503, // Service Unavailable
          headers: corsHeaders,
        }
      );
    }

    // 타임아웃을 설정합니다 (30초)
    // MCP 호출은 네트워크를 통해 이루어지므로 충분한 시간을 허용합니다
    const timeoutMs = 30000;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('요청 시간이 초과되었습니다.')),
        timeoutMs
      )
    );

    // MCP를 통해 자막 가져오기
    let captions: string | null;
    try {
      const captionsPromise = fetchYouTubeCaptionsViaMCP(
        mcpClient,
        youtubeUrl
      );
      captions = await Promise.race([
        captionsPromise,
        timeoutPromise,
      ]);
    } catch (error) {
      console.error('자막 추출 중 오류 발생:', error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.';

      return NextResponse.json(
        {
          error: '자막을 가져오는 중 오류가 발생했습니다.',
          details: errorMessage,
          videoId: videoId,
          suggestion:
            'YouTube에서 자막이 활성화되어 있는지 확인해보세요.',
        },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    } finally {
      // 리소스 정리: MCP 클라이언트 연결을 안전하게 종료합니다
      try {
        if (mcpClient) {
          await mcpClient.close();
          console.log(
            'MCP 클라이언트 연결이 정상적으로 종료되었습니다.'
          );
        }
      } catch (closeError) {
        console.error('MCP 클라이언트 종료 중 오류:', closeError);
      }
    }

    // 자막이 없거나 비어있는 경우
    if (!captions || captions.trim().length === 0) {
      console.log('자막이 비어있거나 null입니다.');
      return NextResponse.json(
        {
          error: '이 동영상에는 사용 가능한 자막이 없습니다.',
          videoId: videoId,
          suggestion:
            'YouTube에서 수동으로 자막이 업로드되어 있는지 확인해보세요.',
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    // 성공적으로 자막을 가져온 경우
    console.log(`자막 추출 성공! (${captions.length}자)`);
    return NextResponse.json(
      {
        captions: captions,
        videoId: videoId,
        message: '자막을 성공적으로 가져왔습니다.',
        length: captions.length,
        provider: 'MCP YouTube Transcript Service',
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error: any) {
    console.error('예상치 못한 API 오류:', error);

    // 마지막 안전장치: 모든 예상치 못한 오류를 처리합니다
    return NextResponse.json(
      {
        error: 'API 처리 중 예상치 못한 오류가 발생했습니다.',
        details: error?.message || '알 수 없는 오류',
        timestamp: new Date().toISOString(),
        suggestion: '문제가 지속되면 관리자에게 문의해주세요.',
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  } finally {
    // 전역 정리 작업
    console.log('=== YouTube 자막 API 요청이 완료되었습니다 ===');
  }
}
