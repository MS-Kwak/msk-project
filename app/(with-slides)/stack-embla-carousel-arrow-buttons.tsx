import { useCallback, useEffect, useState } from 'react';
import style from './stack-embla-carousel-arrow-buttons.module.css';

export const usePrevNextButtons = (emblaApi) => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect).on('select', onSelect);
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  };
};

export const PrevButton = (props) => {
  const { children, ...restProps } = props;

  return (
    <button
      className={`${style.stack_embla_button} ${style.stack_embla_button_prev}`}
      type="button"
      {...restProps}
    >
      <svg
        className={style.stack_embla_button_svg}
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 40 40"
      >
        <rect
          x="22.8"
          y="11.1"
          width="2.9"
          height="2.9"
          transform="translate(48.5 25.1) rotate(-180)"
        />
        <rect
          x="22.8"
          y="14.9"
          width="2.9"
          height="2.9"
          transform="translate(48.5 32.7) rotate(-180)"
        />
        <rect
          x="22.8"
          y="18.7"
          width="2.9"
          height="2.9"
          transform="translate(48.5 40.3) rotate(-180)"
        />
        <rect
          x="22.8"
          y="22.5"
          width="2.9"
          height="2.9"
          transform="translate(48.5 47.9) rotate(-180)"
        />
        <rect
          x="18.8"
          y="22.5"
          width="2.9"
          height="2.9"
          transform="translate(40.6 47.9) rotate(-180)"
        />
        <rect
          x="22.7"
          y="26.4"
          width="2.9"
          height="2.9"
          transform="translate(48.4 55.7) rotate(-180)"
        />
        <rect
          x="22.8"
          y="26.3"
          width="2.9"
          height="2.9"
          transform="translate(48.5 55.6) rotate(-180)"
        />
        <rect
          x="18.8"
          y="18.7"
          width="2.9"
          height="2.9"
          transform="translate(40.6 40.3) rotate(-180)"
        />
        <rect
          x="14.9"
          y="18.7"
          width="2.9"
          height="2.9"
          transform="translate(32.8 40.3) rotate(-180)"
        />
        <rect
          x="18.8"
          y="14.9"
          width="2.9"
          height="2.9"
          transform="translate(40.6 32.7) rotate(-180)"
        />
      </svg>
      {children}
    </button>
  );
};

export const NextButton = (props) => {
  const { children, ...restProps } = props;

  return (
    <button
      className={`${style.stack_embla_button} ${style.stack_embla_button_next}`}
      type="button"
      {...restProps}
    >
      <svg
        className={style.stack_embla_button_svg}
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 40 40"
      >
        <rect x="14.9" y="11.1" width="2.9" height="2.9" />
        <rect x="14.9" y="14.9" width="2.9" height="2.9" />
        <rect x="14.9" y="18.7" width="2.9" height="2.9" />
        <rect x="14.9" y="22.5" width="2.9" height="2.9" />
        <rect x="18.9" y="22.5" width="2.9" height="2.9" />
        <rect x="15" y="26.4" width="2.9" height="2.9" />
        <rect x="14.9" y="26.3" width="2.9" height="2.9" />
        <rect x="18.9" y="18.7" width="2.9" height="2.9" />
        <rect x="22.8" y="18.7" width="2.9" height="2.9" />
        <rect x="18.9" y="14.9" width="2.9" height="2.9" />
      </svg>
      {children}
    </button>
  );
};
