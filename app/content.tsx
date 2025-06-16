import Home from './(with-slides)/home';
import About from './(with-slides)/about';
import StackEmblaCarousel from './(with-slides)/stack-embla-carousel';
import Service from './(with-slides)/service';
import Contact from './(with-slides)/contact';
import { useContext } from 'react';
import { SlideIndexStateContext } from '@/components/carousel/slides';

const Content = () => {
  const slideIndex = useContext(SlideIndexStateContext);

  switch (slideIndex) {
    case 0:
      return <Home />;
    case 1:
      return <About />;
    case 2:
      return <StackEmblaCarousel />;
    case 3:
      return <Service />;
    case 4:
      return <Contact />;
  }
};

export default Content;
