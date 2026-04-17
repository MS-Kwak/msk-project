// 카카오 RAG API Route 전용 서비스
// ⚠️ 'use server' 없음 - API Route(route.ts)에서 직접 import 가능
// ⚠️ cookies() 없음 - 외부 서비스(카카오) 요청에는 세션 쿠키가 없음

import OpenAI from 'openai';
import { createApiAdminClient } from '@/utils/supabase/api-admin';

const openai = new OpenAI({
  apiKey: process.env.NEXT_CHATGPT_OPENAI_API_KEY,
});

export interface SearchResult {
  id: number;
  title: string;
  content: string;
  similarity: number;
}

/**
 * 벡터 유사도 검색 (pgvector)
 * Supabase match_documents RPC 사용
 */
async function searchDocumentsByVector(
  query: string,
  matchThreshold: number = 0.1,
  matchCount: number = 3,
): Promise<SearchResult[]> {
  const supabase = createApiAdminClient();

  // 질문을 임베딩 벡터로 변환
  const embeddingRes = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  const embeddingStr = `[${embeddingRes.data[0].embedding.join(',')}]`;

  // match_documents RPC 호출 (pgvector 유사도 검색)
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embeddingStr,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) {
    console.error('[VectorSearch] RPC Error:', error);
    return [];
  }

  console.log('[VectorSearch] 검색 결과:', data?.length ?? 0, '건');

  return (data ?? []).map(
    (doc: {
      id: number;
      title: string;
      content: string;
      similarity: number;
    }) => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      similarity: doc.similarity,
    }),
  );
}

/**
 * 폴백: 벡터 검색 결과 없을 때 전체 문서 직접 조회
 */
async function getAllDocuments(
  limit: number = 5,
): Promise<SearchResult[]> {
  const supabase = createApiAdminClient();

  const { data, error } = await supabase
    .from('documents')
    .select('id, title, content')
    .order('id', { ascending: true })
    .limit(limit);

  if (error || !data) {
    console.error('[Fallback] 전체 문서 조회 실패:', error);
    return [];
  }

  console.log('[Fallback] 전체 문서 조회:', data.length, '건');
  return data.map((doc) => ({ ...doc, similarity: 0 }));
}

/**
 * 카카오톡용 RAG 답변 생성
 * 1. 벡터 검색으로 관련 문서 검색 (없으면 전체 문서 폴백)
 * 2. GPT-4o-mini에게 문서 + 질문 전달
 * 3. 간결한 한국어 답변 반환
 */
export async function getKakaoRAGAnswer(
  question: string,
): Promise<string> {
  // 1. 벡터 유사도 검색 (임계값 0.1, 최대 3개)
  let docs = await searchDocumentsByVector(question, 0.1, 3);

  // 결과 없으면 전체 문서 폴백
  if (docs.length === 0) {
    console.log('[RAG] 벡터 검색 결과 없음 → 전체 문서 폴백');
    docs = await getAllDocuments(5);
  }

  if (docs.length === 0) {
    return '등록된 문서가 없습니다.';
  }

  // 2. 컨텍스트 구성
  const contextText = docs
    .map((doc, i) => `[문서 ${i + 1}: ${doc.title}]\n${doc.content}`)
    .join('\n\n');

  // 3. GPT-4o-mini 호출
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          '아래 문서를 참고해서 질문에 간결하게 한국어로 답변하세요. 문서에 없는 내용이면 "해당 정보가 없습니다"라고 답하세요.',
      },
      {
        role: 'user',
        content: `참고 문서:\n${contextText}\n\n질문: ${question}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 200,
  });

  return (
    response.choices[0]?.message?.content ??
    '답변을 생성하지 못했습니다.'
  );
}
