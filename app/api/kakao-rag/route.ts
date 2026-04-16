import { NextRequest, NextResponse } from 'next/server';
import { getKakaoRAGAnswer } from './rag-service';

// Edge Runtime: 콜드 스타트 제거 → 카카오 5초 타임아웃 대응
export const runtime = 'edge';

// 카카오 챗봇 응답 형식 헬퍼
const kakaoResponse = (text: string) => ({
  version: '2.0',
  template: {
    outputs: [{ simpleText: { text } }],
    quickReplies: [
      {
        messageText: '다른 질문하기',
        action: 'message',
        label: '다른 질문하기',
      },
    ],
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage: string = body.userRequest?.utterance ?? '';

    console.log('[kakao-rag] utterance:', userMessage);

    if (!userMessage.trim()) {
      return NextResponse.json(
        kakaoResponse('질문을 입력해주세요.'),
        {
          status: 200,
        },
      );
    }

    const answer = await getKakaoRAGAnswer(userMessage);
    console.log('[kakao-rag] answer:', answer);

    return NextResponse.json(kakaoResponse(answer), { status: 200 });
  } catch (error) {
    console.error('[kakao-rag] Error:', error);

    return NextResponse.json(
      kakaoResponse(
        '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      ),
      { status: 200 },
    );
  }
}
