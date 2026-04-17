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

export interface ConversationTurn {
  question: string;
  answer: string;
}

// 사용자별 대화 히스토리 (인스턴스 메모리 내 유지 - UptimeRobot으로 warm 상태 유지)
// 최대 50명 × 최근 3턴 저장
const conversationHistory = new Map<string, ConversationTurn[]>();
const MAX_HISTORY_TURNS = 3;
const MAX_USERS = 50;

export function getHistory(userId: string): ConversationTurn[] {
  return conversationHistory.get(userId) ?? [];
}

export function saveHistory(
  userId: string,
  question: string,
  answer: string,
): void {
  const history = conversationHistory.get(userId) ?? [];
  history.push({ question, answer });

  // 최근 N턴만 유지
  if (history.length > MAX_HISTORY_TURNS) {
    history.splice(0, history.length - MAX_HISTORY_TURNS);
  }

  // 저장 사용자 수 제한 (오래된 순서로 삭제)
  if (
    !conversationHistory.has(userId) &&
    conversationHistory.size >= MAX_USERS
  ) {
    const firstKey = conversationHistory.keys().next().value;
    if (firstKey) conversationHistory.delete(firstKey);
  }

  conversationHistory.set(userId, history);
}

/**
 * 벡터 유사도 검색 (pgvector)
 */
async function searchDocumentsByVector(
  query: string,
  matchThreshold: number = 0.1,
  matchCount: number = 5,
): Promise<SearchResult[]> {
  const supabase = createApiAdminClient();

  const embeddingRes = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  const embeddingStr = `[${embeddingRes.data[0].embedding.join(',')}]`;

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
 * 폴백: 전체 문서 직접 조회
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
 * - 벡터 검색으로 관련 문서 검색
 * - 이전 대화 히스토리 포함하여 GPT 호출
 * - 목록/열거형 답변은 전체 나열
 */
export async function getKakaoRAGAnswer(
  question: string,
  history: ConversationTurn[] = [],
): Promise<string> {
  // 1. 벡터 유사도 검색
  let docs = await searchDocumentsByVector(question, 0.1, 5);

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

  // 3. 대화 히스토리 → GPT messages 구성
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `당신은 회사 정보를 안내하는 챗봇입니다. 아래 문서를 참고해서 한국어로 답변하세요.

규칙:
- 목록이나 항목을 묻는 경우, 문서에 있는 모든 항목을 빠짐없이 나열하세요.
- 숫자나 개수를 묻는 경우, 정확한 수와 함께 항목을 모두 나열하세요.
- 이전 대화 내역이 있으면 참고해서 맥락에 맞게 답변하세요.
- 문서에 없는 내용이면 "앗, 해당 내용은 제가 아직 파악하지 못했어요 😅 다른 궁금한 점이 있으시면 편하게 물어봐 주세요! 🙌"라고 답하세요.
- 답변은 간결하되 정보는 완전하게 전달하세요.`,
    },
  ];

  // 이전 대화 히스토리 추가
  for (const turn of history) {
    messages.push({ role: 'user', content: turn.question });
    messages.push({ role: 'assistant', content: turn.answer });
  }

  // 현재 질문 추가 (문서 컨텍스트 포함)
  messages.push({
    role: 'user',
    content: `참고 문서:\n${contextText}\n\n질문: ${question}`,
  });

  // 4. GPT-4o-mini 호출
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.3,
    max_tokens: 400,
  });

  return (
    response.choices[0]?.message?.content ??
    '답변을 생성하지 못했습니다.'
  );
}
