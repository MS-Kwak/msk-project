import style from './stack-embla-carousel.module.css';
import ReactModal from 'react-modal';
import Buttons from '@/components/buttons';
import { useContext, useState, useEffect } from 'react';
import { SlideIndexStateContext } from '@/components/carousel/slides';
import Modal from '@/components/modal';
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
import { EmblaOptionsType } from 'embla-carousel';
import './stack-embla-carousel.css';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { getStacks } from '@/actions/stack.action';

const OPTIONS: EmblaOptionsType = {
  align: 'start',
  watchDrag: false,
};

const StackEmblaCarousel = () => {
  const slideIndex = useContext(SlideIndexStateContext);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const stacksQuery = useQuery({
    queryKey: ['stack'],
    queryFn: () => getStacks(),
  });

  useEffect(() => {
    if (stacksQuery.data) {
      setModalContent(stacksQuery.data);
    }
    // console.log('stacksQuery.data', stacksQuery.data);
  }, [stacksQuery.data]);

  const stacksQueryData = stacksQuery.data;

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
          {stacksQueryData &&
            stacksQueryData.map((item, index) => (
              <div key={item.id} className={style.stack_embla_slide}>
                <div className={style.image_box}>
                  <div className={style.project_image}>
                    <Image
                      src={item.thumb_image}
                      alt="thumbImage"
                      fill
                    />
                  </div>
                  <h1>{item.title}</h1>
                  <div className={style.project_button}>
                    <Buttons
                      text={'PREVIEW'}
                      type={'LINE'}
                      type2={''}
                      onClick={() => {
                        setModalIsOpen(true);
                        setModalContent(stacksQueryData[index]);
                        console.log(
                          'modalContent',
                          stacksQueryData[index]
                        );
                      }}
                    />
                    <Buttons
                      text={'VISIT'}
                      type={`${!item.url ? `FILL_DISABLED` : `FILL`}`}
                      type2={''}
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
