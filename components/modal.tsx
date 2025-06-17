import { useRef } from 'react';
import useSvgImage from '@/hooks/useSvgImage';
import style from './modal.module.css';
import Image from 'next/image';

const Modal = ({ modalContent }) => {
  // console.log(modalContent);
  const chatBodyRef = useRef(null);

  const onClickScrollDown = () => {
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className={style.Modal}>
      <div className={style.modal_title}>
        <h1>{modalContent.props__modal_title}</h1>
        <div>{modalContent.props__modal_description}</div>
      </div>
      <div ref={chatBodyRef} className={style.modal_image}>
        <div
          className={style.scroll_wrapper}
          onClick={onClickScrollDown}
        >
          <div className={style.scroll}>Scroll Down</div>
          {useSvgImage('scroll')}
        </div>
        <Image
          className={style.image}
          src={modalContent.props__modal_image}
          alt="image"
          layout="fill"
        />
      </div>
    </div>
  );
};

export default Modal;
