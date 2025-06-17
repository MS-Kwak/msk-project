import style from './home.module.css';
import Image from 'next/image';

const Home = () => {
  return (
    <div className={style.Home}>
      <div className={style.logo_wrapper}>
        <Image
          className={style.logo}
          src={'/logo.svg'}
          alt="logo"
          priority
          fill
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div className={style.company}>
        상호: 엠에스케이(msk) | 대표: Kwak Minseo(곽민서)
        <br />
        주소: 경기도 부천시 역곡로 482번길 44, 벨루가3차 402호
        <br />
        전화: 010.3121.3220 | 사업자등록번호: 759-20-01657
        <br />
        Copyright © 2025 Ethan's Dev Project
      </div>
    </div>
  );
};

export default Home;
