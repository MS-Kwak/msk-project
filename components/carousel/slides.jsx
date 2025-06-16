import { createContext } from 'react';
import style from './slides.module.css';
import Description from '@/components/description';
import Social from '@/components/social';
import Login from '@/components/login';
import Content from '@/app/content';

export const SlideIndexStateContext = createContext();

const Slides = (props) => {
  const { index } = props;

  return (
    <SlideIndexStateContext.Provider value={index}>
      <div className={style.embla__slide}>
        <div
          className={`${style.embla__slide_content} ${
            style[`embla__slide_content_${index}`]
          }`}
        >
          {index === 0 && <Social />}
          {index === 4 && <Login />}
          <div className={style.content}>
            <Content />
          </div>
        </div>
        <Description index={index} />
      </div>
    </SlideIndexStateContext.Provider>
  );
};

export default Slides;
