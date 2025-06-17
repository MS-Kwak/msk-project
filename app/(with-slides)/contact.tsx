import style from './contact.module.css';
import './contact.css';
import { useState, useEffect } from 'react';
import { Alert, Stack } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { Spinner } from '@material-tailwind/react';
import { queryClient } from '@/config/ReactQueryClientProvider';
import { createContact } from '@/actions/contact.action';
import { AlertColor } from '@mui/material';

const Contact = () => {
  const [input, setInput] = useState({
    name: '',
    phone: '',
    email: '',
    description: '',
  });

  const createContactMutation = useMutation({
    mutationFn: () =>
      createContact({
        name: input.name,
        phone: input.phone,
        email: input.email,
        description: input.description,
      }),
    onSuccess: () => {
      // queryKey: ['contact'] 퀴리가 한번 다시 리패치됨.
      queryClient.invalidateQueries({
        queryKey: ['contact'],
      });
    },
  });

  const [notification, setNotification] = useState<{
    message: string;
    severity: AlertColor;
    open: boolean;
    showConfirm: boolean;
  }>({
    message: '',
    severity: 'success',
    open: false,
    showConfirm: false, // 확인 버튼 보여줄지 여부
  });

  const showNotification = (
    msg: string,
    severity: AlertColor,
    showConfirm = false
  ) => {
    setNotification({
      message: msg,
      severity,
      open: true,
      showConfirm,
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleConfirm = () => {
    handleCloseNotification();
  };

  const onClickSubmit = async (e) => {
    e.preventDefault();

    if (
      !input.name ||
      !input.phone ||
      !input.email ||
      !input.description
    ) {
      showNotification('모든 필드를 입력해 주세요.', 'error', false);
      return;
    }

    try {
      await createContactMutation.mutateAsync();
      showNotification('문의하기 성공!', 'success', true);
      setInput({
        name: '',
        phone: '',
        email: '',
        description: '',
      });
    } catch (error) {
      showNotification('문의하기 실패!', 'error', false);
    }
  };

  return (
    <div className="contact__container">
      {/* 알림 메시지 표시 */}
      {notification.open && (
        <Stack sx={{ width: '100%', marginBottom: 2 }} spacing={2}>
          <Alert
            severity={notification.severity}
            onClose={handleCloseNotification}
            sx={{ mb: 2 }}
            action={
              notification.showConfirm ? (
                <button
                  className="confirm__button"
                  onClick={handleConfirm}
                >
                  확인
                </button>
              ) : null
            }
          >
            {notification.message}
          </Alert>
        </Stack>
      )}
      <div className={style.Contact}>
        <form className={style.form_container}>
          <input
            className={style.input}
            disabled={createContactMutation.isPending}
            value={input.name}
            onChange={(e) =>
              setInput({ ...input, name: e.target.value })
            }
            required
            name="name"
            placeholder="이름을 입력해 주세요."
          />
          <input
            className={style.input}
            disabled={createContactMutation.isPending}
            value={input.phone}
            onChange={(e) =>
              setInput({ ...input, phone: e.target.value })
            }
            required
            name="phone"
            placeholder="'-'를 제외한 휴대전화번호를 입력해 주세요."
          />
          <input
            className={style.input}
            disabled={createContactMutation.isPending}
            value={input.email}
            onChange={(e) =>
              setInput({ ...input, email: e.target.value })
            }
            required
            name="email"
            placeholder="이메일 주소를 입력해 주세요."
          />
          <textarea
            className={`${style.input} ${style.description}`}
            disabled={createContactMutation.isPending}
            value={input.description}
            onChange={(e) =>
              setInput({ ...input, description: e.target.value })
            }
            required
            name="description"
            placeholder="요청사항을 자유롭게 작성해주세요."
          />

          <button
            className={style.submitButton}
            onClick={onClickSubmit}
            type="submit"
          >
            {createContactMutation.isPending ? (
              <Spinner />
            ) : (
              '문의하기'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Contact;
