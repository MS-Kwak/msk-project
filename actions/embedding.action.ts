'use server';

import OpenAI from 'openai';
import { Database, Json } from 'types_db';
import {
  createServerSupabaseClient,
  createServerSupabaseAdminClient,
} from 'utils/supabase/server';

const openai = new OpenAI({
  apiKey: process.env.NEXT_CHATGPT_OPENAI_API_KEY,
});

export type Document =
  Database['public']['Tables']['documents']['Row'];
export type DocumentInsert =
  Database['public']['Tables']['documents']['Insert'];

export interface SearchResult {
  id: number;
  title: string;
  content: string;
  metadata: Json | null;
  similarity: number;
}

const handleError = (error: Error | { message: string }) => {
  console.error(error);
  throw new Error(error.message);
};

/**
 * 텍스트를 벡터(임베딩)로 변환
 */
export async function generateEmbedding(
  text: string,
): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * 문서 저장 (임베딩 자동 생성)
 */
export async function createDocument(input: {
  title: string;
  content: string;
  metadata?: Json;
}): Promise<Document | null> {
  const supabase = await createServerSupabaseClient();

  // 1. 콘텐츠로 임베딩 생성
  const embedding = await generateEmbedding(input.content);

  // 2. 벡터를 문자열 형식으로 변환 (pgvector 형식)
  const embeddingStr = `[${embedding.join(',')}]`;

  // 3. 문서와 임베딩을 함께 저장
  const { data, error } = await supabase
    .from('documents')
    .insert({
      title: input.title,
      content: input.content,
      embedding: embeddingStr,
      metadata: input.metadata || {},
    })
    .select()
    .single();

  if (error) {
    handleError(error);
  }

  return data;
}

/**
 * 여러 문서 일괄 저장
 */
export async function createDocuments(
  inputs: { title: string; content: string; metadata?: Json }[],
): Promise<number> {
  let successCount = 0;

  for (const input of inputs) {
    try {
      await createDocument(input);
      successCount++;
    } catch (error) {
      console.error(
        `Failed to create document: ${input.title}`,
        error,
      );
    }
  }

  return successCount;
}

/**
 * 벡터 유사도 검색 (RAG 검색)
 * 현재: 모든 문서 반환 (카카오톡 5초 타임아웃 대응)
 * 문서 10개 이상 시: Edge Function 사용 권장
 */
export async function searchDocuments(
  query: string,
  matchThreshold: number = 0.1,
  matchCount: number = 5,
): Promise<SearchResult[]> {
  const supabase = await createServerSupabaseAdminClient();

  const { data: allDocs, error } = await supabase
    .from('documents')
    .select('id, title, content, metadata')
    .limit(matchCount);

  if (error) {
    console.error('[Search] Error:', error);
    return [];
  }

  console.log('[Search] Found', allDocs?.length || 0, 'documents');

  return (allDocs || []).map(doc => ({
    id: doc.id,
    title: doc.title,
    content: doc.content,
    metadata: doc.metadata,
    similarity: 0.8,
  }));
}

/**
 * 모든 문서 조회 (임베딩 제외)
 */
export async function getDocuments(): Promise<
  Omit<Document, 'embedding'>[]
> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('documents')
    .select('id, title, content, metadata, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    handleError(error);
  }

  return data || [];
}

/**
 * 문서 삭제
 */
export async function deleteDocument(id: number): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) {
    handleError(error);
    return false;
  }

  return true;
}
