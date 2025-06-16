import useNavImage from '@/hooks/useNavImage';
import Buttons from '@/components/buttons';
import style from './thumb.module.css';

const Thumb = (props) => {
  const { selected, index, onClick } = props;

  return (
    <div
      className={`${style.embla__thumbs_slide} ${
        selected ? style['embla__thumbs_slide_selected'] : ''
      }`}
    >
      <Buttons
        type={'WHITE'}
        onClick={onClick}
        text={useNavImage(index)}
      />
    </div>
  );
};

export default Thumb;
