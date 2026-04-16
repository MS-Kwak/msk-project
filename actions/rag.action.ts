'use server';

import OpenAI from 'openai';
import { searchDocuments, SearchResult } from './embedding.action';

const openai = new OpenAI({
  apiKey: process.env.NEXT_CHATGPT_OPENAI_API_KEY,
});

/**
 * RAG 기반 답변 생성
 * 1. 질문과 유사한 문서 검색
 * 2. 검색된 문서를 컨텍스트로 프롬프트 구성
 * 3. LLM 호출하여 답변 생성
 */
export async function generateRAGResponse(
  question: string,
  options?: {
    matchThreshold?: number;
    matchCount?: number;
    systemPrompt?: string;
  },
): Promise<{
  answer: string;
  sources: SearchResult[];
}> {
  const {
    matchThreshold = 0.5,
    matchCount = 3,
    systemPrompt,
  } = options || {};

  // 1. 유사 문서 검색
  const relevantDocs = await searchDocuments(
    question,
    matchThreshold,
    matchCount,
  );

  // 2. 프롬프트 구성
  const contextText =
    relevantDocs.length > 0
      ? relevantDocs
          .map(
            (doc, i) =>
              `[문서 ${i + 1}: ${doc.title}]\n${doc.content}`,
          )
          .join('\n\n')
      : '관련 문서를 찾지 못했습니다.';

  const defaultSystemPrompt = `문서 기반 답변. 문서에 없으면 "해당 정보가 없습니다". 간결하게 한국어로.`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPrompt || defaultSystemPrompt,
    },
    {
      role: 'user',
      content: `참고 문서:\n${contextText}\n\n질문: ${question}`,
    },
  ];

  // 3. LLM 호출 (카카오톡 5초 타임아웃 대응: 최소 설정)
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.3,
    max_tokens: 150,
  });

  const answer =
    response.choices[0]?.message?.content ||
    '답변을 생성하지 못했습니다.';

  return {
    answer,
    sources: relevantDocs,
  };
}

/**
 * 카카오톡용 간단 RAG 응답 (텍스트만 반환)
 */
export async function getKakaoRAGAnswer(
  question: string,
): Promise<string> {
  try {
    const { answer } = await generateRAGResponse(question, {
      matchThreshold: 0,
      matchCount: 2,
    });
    return answer;
  } catch (error) {
    console.error('RAG Error:', error);
    return '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다.';
  }
}
