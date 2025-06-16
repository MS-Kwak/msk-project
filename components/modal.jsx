import { useRef } from 'react';
import useSvgImage from '@/hooks/useSvgImage';
import style from './modal.module.css';
import Image from 'next/image';

const Modal = ({ modalContent }) => {
  console.log(modalContent.props);
  const props = modalContent.props;
  const chatBodyRef = useRef();

  const onClickScrollDown = () => {
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className={style.Modal}>
      <div className={style.modal_title}>
        <h1>{props.modalTitle}</h1>
        <div>{props.modalDescription}</div>
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
          src={props.modalImage}
          alt="image"
          layout="fill"
        />
      </div>
    </div>
  );
};

export default Modal;
