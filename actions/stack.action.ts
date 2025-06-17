'use server';

import { Database } from 'types_db';
import { createServerSupabaseClient } from 'utils/supabase/server';

export type StackRow = Database['public']['Tables']['stack']['Row'];
export type StackRowInsert =
  Database['public']['Tables']['stack']['Insert'];

const handleError = (error) => {
  console.error(error);
  throw new Error(error.message);
};

export async function getStacks(): Promise<StackRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('stack')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    handleError(error);
  }

  return data;
}

export async function uploadFileAndSaveMetadata(params) {
  const { thumbFile, modalFile, modalData } = params;
  const supabase = await createServerSupabaseClient();

  console.log('업로드할 썸네일 파일:', thumbFile);
  console.log('업로드할 상세 이미지 파일:', modalFile);
  console.log('모달 데이터:', modalData);

  // 1. 썸네일 업로드
  const { data: thumbUploadData, error: thumbError } =
    await supabase.storage
      .from('thumbnailbox')
      .upload(thumbFile.name, thumbFile, {
        upsert: true,
      });

  if (thumbError || !thumbUploadData) {
    throw new Error(
      `썸네일 파일 업로드 실패: ${
        thumbError?.message || '알 수 없는 오류'
      }`
    );
  }

  // 썸네일 URL 생성
  const { data: thumbPublicData } = supabase.storage
    .from('thumbnailbox')
    .getPublicUrl(thumbUploadData.path);
  if (!thumbPublicData) {
    throw new Error(`썸네일 파일 URL 생성 실패`);
  }
  const thumbImageUrl = thumbPublicData?.publicUrl;
  console.log('썸네일 이미지 URL:', thumbImageUrl);

  // 2. 상세이미지 업로드
  const { data: modalUploadData, error: modalError } =
    await supabase.storage
      .from('modalbox')
      .upload(modalFile.name, modalFile, {
        upsert: true,
      });
  if (modalError || !modalUploadData) {
    throw new Error(
      `상세 이미지 업로드 실패: ${
        modalError?.message || '알 수 없는 오류'
      }`
    );
  }

  // 상세이미지 URL 생성
  const { data: modalPublicData } = supabase.storage
    .from('modalbox')
    .getPublicUrl(modalUploadData.path);
  if (!modalPublicData) {
    throw new Error(`상세 이미지 URL 생성 실패`);
  }
  const modalImageUrl = modalPublicData?.publicUrl;

  // 3. DB에 저장
  const { data, error: insertError } = await supabase
    .from('stack')
    .insert({
      thumb_image: thumbImageUrl,
      title: modalData.title,
      url: modalData.url,
      modal_title: modalData.modal_title,
      modal_description: modalData.modal_description,
      modal_image: modalImageUrl,
      created_at: new Date().toISOString(),
    });
  if (insertError) {
    throw new Error(`DB 저장 실패: ${insertError.message}`);
  }

  return data;
}
