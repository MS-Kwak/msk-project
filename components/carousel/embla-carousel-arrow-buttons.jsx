import { useCallback, useEffect } from 'react';
import style from './embla-carousel-arrow-buttons.module.css';
import useSvgImage from '@/hooks/useSvgImage';

export const usePrevNextButtons = (emblaApi, onButtonClick) => {
  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
    if (onButtonClick) onButtonClick(emblaApi);
  }, [emblaApi, onButtonClick]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
    if (onButtonClick) onButtonClick(emblaApi);
  }, [emblaApi, onButtonClick]);

  useEffect(() => {
    if (!emblaApi) return;
  }, [emblaApi]);

  return {
    onPrevButtonClick,
    onNextButtonClick,
  };
};

export const PrevButton = (props) => {
  const { children, ...restProps } = props;

  return (
    <button
      className={`${style.embla__button} ${style.embla__button_prev}`}
      type="button"
      {...restProps}
    >
      {useSvgImage('prevButton')}
      {children}
    </button>
  );
};

export const NextButton = (props) => {
  const { children, ...restProps } = props;

  return (
    <button
      className={`${style.embla__button} ${style.embla__button_next}`}
      type="button"
      {...restProps}
    >
      {useSvgImage('nextButton')}
      {children}
    </button>
  );
};
