'use client';
import { CircularProgress } from '@mui/material';
import style from './upload.module.css';
import { useCallback, useState } from 'react';
import { uploadFileAndSaveMetadata } from '@/actions/stack.action';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/config/ReactQueryClientProvider';
import { useDropzone } from 'react-dropzone';

export default function UploadPage() {
  const uploadIamgeMutation = useMutation({
    mutationFn: uploadFileAndSaveMetadata,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['image', 'stack'],
      });
    },
  });

  // 폼 데이터 상태
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [thumbFile, setThumbFile] = useState(null);
  const [modalFile, setModalFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const handleThumbDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setThumbFile(acceptedFiles[0]);
    }
  };

  const handleModalDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setModalFile(acceptedFiles[0]);
    }
  };

  const {
    getRootProps: getRootPropsThumb,
    getInputProps: getInputPropsThumb,
    isDragActive: isDragActiveThumb,
  } = useDropzone({
    onDrop: handleThumbDrop,
    multiple: false,
  });
  const {
    getRootProps: getRootPropsModal,
    getInputProps: getInputPropsModal,
    isDragActive: isDragActiveModal,
  } = useDropzone({
    onDrop: handleModalDrop,
    multiple: false,
  });

  const handleUploadClick = async () => {
    if (
      !thumbFile ||
      !modalFile ||
      !title ||
      !modalTitle ||
      !modalDescription
    ) {
      alert('모든 항목을 채우거나 파일을 선택하세요.');
      return;
    }
    setLoading(true);
    setResultMsg(null);
    try {
      await uploadIamgeMutation.mutateAsync({
        thumbFile,
        modalFile,
        modalData: {
          title,
          url,
          modal_title: modalTitle,
          modal_description: modalDescription,
        },
      });
      setResultMsg('업로드 성공!');
      // 폼 초기화
      setThumbFile(null);
      setModalFile(null);
      setTitle('');
      setUrl('');
      setModalTitle('');
      setModalDescription('');
    } catch (error) {
      console.error('업로드 실패:', error);
      setResultMsg('업로드 실패: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.fileDragDropZone}>
      {/* 썸네일 파일 드롭존 */}
      <div {...getRootPropsThumb()} className={style.dropzone}>
        <input {...getInputPropsThumb()} />
        {isDragActiveThumb ? (
          <p>썸네일 파일을 여기로 드래그하세요</p>
        ) : (
          <p>썸네일 이미지를 끌어다 놓거나 클릭하세요</p>
        )}
        {thumbFile && <p>선택된 파일: {thumbFile.name}</p>}
      </div>

      {/* 상세 이미지 드롭존 */}
      <div {...getRootPropsModal()} className={style.dropzone}>
        <input {...getInputPropsModal()} />
        {isDragActiveModal ? (
          <p>상세 이미지 파일을 여기로 드래그하세요</p>
        ) : (
          <p>상세 이미지를 끌어다 놓거나 클릭하세요</p>
        )}
        {modalFile && <p>선택된 파일: {modalFile.name}</p>}
      </div>

      {/* 기타 입력 필드 */}
      <form className={style.inputArea}>
        <input
          className={style.input}
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className={style.input}
          type="text"
          placeholder="사이트 URL 또는 링크"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <input
          className={style.input}
          type="text"
          placeholder="모달 타이틀"
          value={modalTitle}
          onChange={(e) => setModalTitle(e.target.value)}
        />
        <input
          className={style.input}
          type="text"
          placeholder="모달 설명"
          value={modalDescription}
          onChange={(e) => setModalDescription(e.target.value)}
        />

        {/* 업로드 버튼 */}
        <button
          className={style.uploadButton}
          onClick={handleUploadClick}
          disabled={loading}
        >
          {uploadIamgeMutation.isPending ? (
            <CircularProgress size={16} />
          ) : (
            '업로드'
          )}
        </button>
      </form>

      {/* 업로드 결과 메시지 */}
      {resultMsg && (
        <div className={style.resultMessage}>{resultMsg}</div>
      )}
    </div>
  );
}
