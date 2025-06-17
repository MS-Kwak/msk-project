import style from './description.module.css';
import { useContext } from 'react';
import { SlideIndexStateContext } from '@/components/carousel/slides';
import Image from 'next/image';

const Description = () => {
  const slideIndex = useContext(SlideIndexStateContext);
  const descriptionList = [
    {
      id: slideIndex,
      text: `Hello I'm Fullstack Developer`,
    },
    {
      id: slideIndex,
      text: `Get To Know About Me`,
    },
    {
      id: slideIndex,
      text: `My Tech Stack`,
    },
    {
      id: slideIndex,
      text: `Services I Offer`,
    },
    {
      id: slideIndex,
      text: `Contact Me Anytime`,
    },
  ];

  return (
    <div className={style.embla__slide_description}>
      <Image
        className={style.iconRed}
        width={20}
        height={20}
        src={'/icon-red.svg'}
        alt="icon"
      />
      {descriptionList[slideIndex].text}
    </div>
  );
};

export default Description;
