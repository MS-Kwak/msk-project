import style from './page.module.css';
import Carousel from '@/components/carousel/carousel';

export const metadata = {
  title: `Ethan's Dev Lab`,
  description: '이든의 개발 연구소에 오신걸 환영합니다',
  openGraph: {
    title: `Ethan's Dev Lab`,
    description: '이든의 개발 프로젝트에 오신걸 환영합니다',
    images: ['/thumbnail.png'], // public 폴더에 넣어야 함
  },
};

export default function Home() {
  return (
    <div className={style.container}>
      <Carousel />
    </div>
  );
}
