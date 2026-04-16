import { NextRequest, NextResponse } from 'next/server';
import { getKakaoRAGAnswer } from '@/actions/rag.action';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 카카오 챗봇으로부터 받은 사용자 메시지
    const userMessage = body.userRequest?.utterance || '';

    console.log('[RAG] User message:', userMessage);

    // 빈 메시지 처리
    if (!userMessage.trim()) {
      return NextResponse.json(
        {
          version: '2.0',
          template: {
            outputs: [
              {
                simpleText: {
                  text: '질문을 입력해주세요.',
                },
              },
            ],
          },
        },
        { status: 200 },
      );
    }

    // RAG 기반 답변 생성
    const answer = await getKakaoRAGAnswer(userMessage);

    console.log('[RAG] Answer:', answer);

    // 카카오톡 응답 형식
    const response = {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: answer,
            },
          },
        ],
        quickReplies: [
          {
            messageText: '다른 질문하기',
            action: 'message',
            label: '다른 질문하기',
          },
        ],
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[RAG] API Error:', error);

    return NextResponse.json(
      {
        version: '2.0',
        template: {
          outputs: [
            {
              simpleText: {
                text: '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
              },
            },
          ],
        },
      },
      { status: 200 },
    );
  }
}
