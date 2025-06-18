import style from './embla-carousel.module.css';
import { useCallback, useState, useEffect } from 'react';
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from './embla-carousel-arrow-buttons';
import {
  SelectedSnapDisplay,
  useSelectedSnapDisplay,
} from './embla-carousel-selected-snap-display';
import useEmblaCarousel from 'embla-carousel-react';
import Thumb from './thumb';
import Slides from './slides';

const EmblaCarousel = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index) => {
      if (!emblaApi || !emblaThumbsApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi, emblaThumbsApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaApi.selectedScrollSnap());
  }, [emblaApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();

    emblaApi.on('select', onSelect).on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const onNavButtonClick = useCallback((emblaApi) => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;

    const resetOrStop =
      autoplay.options.stopOnInteraction === false
        ? autoplay.reset
        : autoplay.stop;

    resetOrStop();
  }, []);

  const { onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(
    emblaApi,
    onNavButtonClick
  );

  const { selectedSnap, snapCount } =
    useSelectedSnapDisplay(emblaApi);

  return (
    <section className={style.EmblaCarousel}>
      <div className={style.embla__viewport} ref={emblaRef}>
        <div className={style.embla__container}>
          {slides.map((index) => (
            <Slides key={index} index={index} />
          ))}
        </div>
      </div>

      <div className={style.embla__controls_wrapper}>
        <div className={style.embla__controls}>
          <PrevButton onClick={onPrevButtonClick} />
          <SelectedSnapDisplay
            selectedSnap={selectedSnap}
            snapCount={snapCount}
          />
          <NextButton onClick={onNextButtonClick} />
        </div>

        <div
          className={style.embla__thumbs_viewport}
          ref={emblaThumbsRef}
        >
          <div className={style.embla__thumbs_container}>
            {slides.map((index) => (
              <Thumb
                key={index}
                onClick={() => onThumbClick(index)}
                selected={index === selectedIndex}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmblaCarousel;
