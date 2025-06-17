import style from './about.module.css';
import { SlideIndexStateContext } from '@/components/carousel/slides';
import useSvgImage from '@/hooks/useSvgImage';
import { useContext } from 'react';

const About = () => {
  const slideIndex = useContext(SlideIndexStateContext);

  return (
    <div
      className={`${style.conetent_box} ${
        style[`conetent_box_${slideIndex}`]
      }`}
    >
      <div className={style.image_box}>
        {useSvgImage('experience')}
        <h1>Experience</h1>
        <div>10+ Years Working</div>
        <div id="KR">
          10년 이상의 개발 경력
          <br />
          프론트엔드 개발 전문
        </div>
      </div>
      <div className={style.image_box}>
        {useSvgImage('client')}
        <h1>Clients</h1>
        <div>50+ worldwide</div>
        <div id="KR">
          50명 이상의 개인/법인과 협업
          <br />
          현재 대기업 AI챗봇 운영중
        </div>
      </div>
      <div className={style.image_box}>
        {useSvgImage('project')}
        <h1>Projects</h1>
        <div>100+ completed</div>
        <div id="KR">
          100개 이상의 프로젝트 진행
          <br />
          React/Nodejs/Android/iOS
        </div>
      </div>
    </div>
  );
};

export default About;
