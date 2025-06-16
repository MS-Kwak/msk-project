import style from './stack-embla-carousel.module.css';
import ReactModal from 'react-modal';
import Buttons from '@/components/buttons';
import { useContext, useState, useEffect } from 'react';
import { SlideIndexStateContext } from '@/components/carousel/slides';
import Modal from '@/components/modal';
import stacksData from '@/mock/stacks.json';
import {
  DotButton,
  useDotButton,
} from './stack-embla-carousel-dot-button';
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from './stack-embla-carousel-arrow-buttons';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import './stack-embla-carousel.css';

const OPTIONS = { align: 'start', watchDrag: false };

const StackEmblaCarousel = () => {
  const slideIndex = useContext(SlideIndexStateContext);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(stacksData);

  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  // modal 창 팝업 시 뒤에 배경 scroll 막기
  useEffect(() => {
    modalIsOpen
      ? (document.body.style.overflow = 'hidden')
      : (document.body.style.overflow = 'unset');
  }, [modalIsOpen]);

  const OpenWindow = (url, name = '_blank', features = '') => {
    const newWindow = window.open(url, name, features);
    return newWindow;
  };

  return (
    <div
      className={`${style.conetent_box} ${
        style[`conetent_box_${slideIndex}`]
      }`}
    >
      <div className={style.stack_embla_viewport} ref={emblaRef}>
        <div className={style.stack_embla_container}>
          {stacksData.map((item, index) => (
            <div
              key={item.modalId}
              className={style.stack_embla_slide}
            >
              <div className={style.image_box} key={item.modalId}>
                <div className={style.project_image}>
                  <Image
                    src={item.thumbImage}
                    alt="thumbImage"
                    fill
                  />
                </div>
                <h1>{item.title}</h1>
                <div className={style.project_button}>
                  <Buttons
                    text={'PREVIEW'}
                    type={'LINE'}
                    onClick={() => {
                      setModalIsOpen(true);
                      setModalContent(stacksData[index]);
                    }}
                  />
                  <Buttons
                    text={'VISIT'}
                    type={`${!item.url ? `FILL_DISABLED` : `FILL`}`}
                    onClick={() => item.url && OpenWindow(item.url)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={style.stack_embla_controls}>
        <div className={style.stack_embla_buttons}>
          <PrevButton
            onClick={onPrevButtonClick}
            disabled={prevBtnDisabled}
          />
          <NextButton
            onClick={onNextButtonClick}
            disabled={nextBtnDisabled}
          />
        </div>

        <div className={style.stack_embla_dots}>
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={`${style.stack_embla_dot} ${
                index === selectedIndex
                  ? style['stack_embla_dot_selected']
                  : ''
              }`}
            />
          ))}
        </div>
      </div>

      <ReactModal ariaHideApp={false} isOpen={modalIsOpen}>
        <button
          className={style.modal_close_button}
          onClick={() => setModalIsOpen(false)}
        >
          <Image
            src={'/button-close.svg'}
            width={30}
            height={30}
            alt="닫기버튼"
          />
        </button>
        <Modal modalContent={modalContent} />
      </ReactModal>
    </div>
  );
};

export default StackEmblaCarousel;
