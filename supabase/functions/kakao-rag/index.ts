// Supabase Edge Function: kakao-rag
// - 콜드 스타트 없음 (전 세계 분산 엣지 서버)
// - DB와 같은 서버 → pgvector 조회 초고속
// - OpenAI API 2회 호출 (임베딩 + GPT) 유지하되 안정적으로 동작

import { createClient } from 'npm:@supabase/supabase-js@2';
import OpenAI from 'npm:openai@4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

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

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY')!,
  });

  const respond = (data: object, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

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
      return respond(
        kakaoResponse('무엇이 궁금하신가요? 질문을 입력해주세요. 😊'),
      );
    }

    // ── 1. 대화 히스토리 조회 ───────────────────────────────────────────────
    const { data: historyRows } = await supabase
      .from('conversations')
      .select('question, answer')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    const history = (historyRows ?? []).reverse(); // 오래된 순으로

    // ── 2. 임베딩 생성 + 벡터 검색 ────────────────────────────────────────
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: userMessage,
    });
    const embeddingStr = `[${embeddingRes.data[0].embedding.join(',')}]`;

    const { data: vectorDocs, error: rpcError } = await supabase.rpc(
      'match_documents',
      {
        query_embedding: embeddingStr,
        match_threshold: 0.05,
        match_count: 7,
      },
    );

    // 결과 없으면 전체 문서 폴백
    let docs = vectorDocs ?? [];
    if (rpcError || docs.length === 0) {
      console.log('[RAG] 벡터 검색 결과 없음 → 전체 문서 폴백');
      const { data: allDocs } = await supabase
        .from('documents')
        .select('id, title, content')
        .limit(15);
      docs = allDocs ?? [];
    }

    console.log('[RAG] 검색된 문서:', docs.length, '건');

    if (docs.length === 0) {
      return respond(kakaoResponse('등록된 문서가 없습니다.'));
    }

    // ── 3. 컨텍스트 + GPT 호출 ────────────────────────────────────────────
    const contextText = docs
      .map(
        (doc: { title: string; content: string }, i: number) =>
          `[문서 ${i + 1}: ${doc.title}]\n${doc.content}`,
      )
      .join('\n\n');

    const messages: { role: string; content: string }[] = [
      {
        role: 'system',
        content: `당신은 (주)보노보플랫폼의 안내 챗봇입니다. 아래 문서를 참고해서 한국어로 답변하세요.

규칙:
- 질문에 포함된 연도, 기간, 키워드와 관련된 문서가 있으면 적극적으로 활용하세요. 예를 들어 "2026년 실적"을 물으면 "개발 실적 (2024~2026)" 같은 범위 문서를 참고하세요.
- 정확히 일치하지 않아도, 관련 있는 문서 내용을 바탕으로 최대한 답변하세요.
- 목록이나 항목을 묻는 경우, 문서에 있는 모든 항목을 빠짐없이 나열하세요.
- 숫자나 개수를 묻는 경우, 정확한 수와 함께 항목을 모두 나열하세요.
- 이전 대화 내역이 있으면 참고해서 맥락에 맞게 답변하세요.
- 문서를 충분히 검토한 후에도 전혀 관련 내용이 없을 때만 "앗, 해당 내용은 제가 아직 파악하지 못했어요 😅 다른 궁금한 점이 있으시면 편하게 물어봐 주세요! 🙌"라고 답하세요.
- 답변은 간결하되 정보는 완전하게 전달하세요.`,
      },
    ];

    // 이전 대화 히스토리 추가
    for (const turn of history) {
      messages.push({ role: 'user', content: turn.question });
      messages.push({ role: 'assistant', content: turn.answer });
    }

    // 현재 질문 추가
    messages.push({
      role: 'user',
      content: `참고 문서:\n${contextText}\n\n질문: ${userMessage}`,
    });

    const gptRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as never,
      temperature: 0.3,
      max_tokens: 300,
    });

    const answer =
      gptRes.choices[0]?.message?.content ??
      '답변을 생성하지 못했습니다.';

    console.log('[RAG] Answer:', answer);

    // ── 4. 대화 히스토리 저장 (최근 10건 초과 시 오래된 것 삭제) ──────────
    await supabase.from('conversations').insert({
      user_id: userId,
      question: userMessage,
      answer,
    });

    // 오래된 히스토리 정리 (사용자별 최근 10건만 유지)
    const { data: oldRows } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(10, 1000);

    if (oldRows && oldRows.length > 0) {
      const oldIds = oldRows.map((r: { id: number }) => r.id);
      await supabase.from('conversations').delete().in('id', oldIds);
    }

    return respond(kakaoResponse(answer));
  } catch (error) {
    console.error('[kakao-rag] Error:', error);
    return respond(
      kakaoResponse(
        '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      ),
    );
  }
});
