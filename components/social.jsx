import { useEffect } from 'react';
import useSocialImage from '@/hooks/useSocialImage';
import Buttons from '@/components/buttons';
import style from './social.module.css';

const Social = () => {
  const API_KAKAO_ADMIN_KEY = process.env.NEXT_PUBLIC_KAKAO_ADMIN_KEY;
  const KAKAO_PUBLIC_KEY = '_xfqyBn';

  useEffect(() => {
    // 클라이언트에서만 실행
    if (typeof window !== 'undefined') {
      // SDK 스크립트 동적 로드
      const script = document.createElement('script');
      script.src =
        'https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js';
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          // init 해주기 전에 clean up 을 해준다.
          window.Kakao.cleanup();
          // 카카오에서 제공받은 Admin key를 넣어줌 -> .env파일에서 호출시킴
          window.Kakao.init(API_KAKAO_ADMIN_KEY);
          window.Kakao.isInitialized();
        }
      };
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  const OpenWindow = (url, name = '_blank', features = '') => {
    const newWindow = window.open(url, name, features);
    return newWindow;
  };

  // 카카오채널추가
  const onClickAddKakaoChannel = () => {
    if (typeof window !== 'undefined' && window.Kakao) {
      window.Kakao.Channel.addChannel({
        channelPublicId: KAKAO_PUBLIC_KEY,
      });
    }
  };

  // 톡상담
  const onClickChatChannel = () => {
    if (typeof window !== 'undefined' && window.Kakao) {
      window.Kakao.Channel.chat({
        channelPublicId: KAKAO_PUBLIC_KEY,
      });
    }
  };

  return (
    <div className={style.socials}>
      <Buttons
        text={useSocialImage('github')}
        type={'WHITE'}
        onClick={() => OpenWindow('https://github.com/MS-Kwak')}
      />
      <Buttons
        text={useSocialImage('kakaochannel')}
        type={'WHITE'}
        type2={'KAKAO'}
        onClick={onClickAddKakaoChannel}
      />
      <Buttons
        text={useSocialImage('chatchannel')}
        type={'WHITE'}
        type2={'KAKAO'}
        onClick={onClickChatChannel}
      />
    </div>
  );
};

export default Social;
