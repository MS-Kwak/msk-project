import { NextRequest, NextResponse } from 'next/server';
import {
  getKakaoRAGAnswer,
  getHistory,
  saveHistory,
} from './rag-service';

// Vercel 함수 최대 실행 시간 (초)
export const maxDuration = 10;

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

// Keep-alive: UptimeRobot 등이 주기적으로 GET 핑 → 콜드 스타트 방지
export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage: string = body.userRequest?.utterance ?? '';
    const userId: string = body.userRequest?.user?.id ?? 'anonymous';

    console.log(
      '[kakao-rag] userId:',
      userId,
      '| utterance:',
      userMessage,
    );

    if (
      !userMessage.trim() ||
      userMessage.trim() === '다른 질문하기'
    ) {
      return NextResponse.json(
        kakaoResponse('무엇이 궁금하신가요? 질문을 입력해주세요. 😊'),
        { status: 200 },
      );
    }

    // 해당 사용자의 이전 대화 히스토리 조회
    const history = getHistory(userId);

    // RAG 답변 생성
    const answer = await getKakaoRAGAnswer(userMessage, history);
    console.log('[kakao-rag] answer:', answer);

    // 대화 히스토리 저장
    saveHistory(userId, userMessage, answer);

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
