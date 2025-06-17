import style from './service.module.css';
import useSvgImage from '@/hooks/useSvgImage';
import { useContext } from 'react';
import { SlideIndexStateContext } from '@/components/carousel/slides';

const Service = () => {
  const slideIndex = useContext(SlideIndexStateContext);

  return (
    <div
      className={`${style.conetent_box} ${
        style[`conetent_box_${slideIndex}`]
      }`}
    >
      <div className={style.image_box}>
        <h1>Frontend Development</h1>
        <div className={style.skill_wrapper}>
          <div className={style.skill_box}>
            {useSvgImage('skill')}
            <div id="KR">Next.js</div>
          </div>
          <div className={style.skill_box}>
            {useSvgImage('skill')}
            <div id="KR">React + Vite</div>
          </div>
          <div className={style.skill_box}>
            {useSvgImage('skill')}
            <div id="KR">javascript</div>
          </div>
          <div className={style.skill_box}>
            {useSvgImage('skill')}
            <div id="KR">Typescript</div>
          </div>
        </div>
      </div>
      <div className={style.image_box}>
        <h1>Backend Development</h1>
        <div className={style.skill_wrapper}>
          <div className={style.skill_box}>
            {useSvgImage('skill')}
            <div id="KR">Supabase</div>
          </div>
          <div className={style.skill_box}>
            {useSvgImage('skill')}
            <div id="KR">PostgreSQL</div>
          </div>
          <div className={style.skill_box}>
            {useSvgImage('skill')}
            <div id="KR">Node.js</div>
          </div>
          <div className={style.skill_box}>
            {useSvgImage('skill')}
            <div id="KR">Phython</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Service;
