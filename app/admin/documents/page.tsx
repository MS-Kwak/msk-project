'use client';

import { useState } from 'react';
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  TextField,
  CircularProgress,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/config/ReactQueryClientProvider';
import {
  getDocuments,
  createDocument,
  deleteDocument,
} from '@/actions/embedding.action';
import styles from './documents.module.css';

export default function DocumentsPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const documentsQuery = useQuery({
    queryKey: ['documents'],
    queryFn: () => getDocuments(),
  });

  const createMutation = useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setTitle('');
      setContent('');
      setMessage({ type: 'success', text: '문서가 저장되었습니다.' });
    },
    onError: (error: Error) => {
      setMessage({
        type: 'error',
        text: `저장 실패: ${error.message}`,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setMessage({ type: 'success', text: '문서가 삭제되었습니다.' });
    },
    onError: (error: Error) => {
      setMessage({
        type: 'error',
        text: `삭제 실패: ${error.message}`,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMessage({
        type: 'error',
        text: '제목과 내용을 모두 입력해주세요.',
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await createMutation.mutateAsync({ title, content });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className={styles.container}>
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <h2>RAG 문서 추가</h2>
        <p className={styles.description}>
          챗봇이 답변할 때 참고할 문서를 추가합니다. 문서는 자동으로
          벡터화되어 저장됩니다.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="문서 제목 (예: 회사 소개, FAQ, 제품 설명 등)"
            size="small"
          />
          <TextField
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            rows={6}
            margin="normal"
            placeholder="문서 내용 (챗봇이 참고할 내용을 입력하세요...)"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || createMutation.isPending}
            sx={{
              marginTop: 2,
              borderRadius: 0,
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
            }}
          >
            {loading || createMutation.isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              '문서 저장 (임베딩 생성)'
            )}
          </Button>
        </form>

        {message && (
          <p
            className={
              message.type === 'success'
                ? styles.successMessage
                : styles.errorMessage
            }
          >
            {message.text}
          </p>
        )}
      </Paper>

      <Paper sx={{ padding: 3 }}>
        <h2>저장된 문서 목록</h2>
        <p className={styles.description}>
          총 {documentsQuery.data?.length || 0}개의 문서가 저장되어
          있습니다.
        </p>

        {documentsQuery.isLoading ? (
          <CircularProgress />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>번호</TableCell>
                <TableCell>제목</TableCell>
                <TableCell>내용 (미리보기)</TableCell>
                <TableCell>등록일</TableCell>
                <TableCell>삭제</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documentsQuery.data?.map((doc, index) => (
                <TableRow key={doc.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{doc.title}</TableCell>
                  <TableCell>
                    {doc.content.length > 100
                      ? doc.content.substring(0, 100) + '...'
                      : doc.content}
                  </TableCell>
                  <TableCell>
                    {doc.created_at
                      ? new Date(doc.created_at).toLocaleDateString(
                          'ko-KR',
                        )
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleDelete(doc.id)}
                      color="error"
                      disabled={deleteMutation.isPending}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {(!documentsQuery.data ||
                documentsQuery.data.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    저장된 문서가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </div>
  );
}
