import style from './buttons.module.css';

const Buttons = ({ text, type, type2, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`${style.Buttons} ${style[`Buttons_${type}`]} ${
        style[`Buttons_${type2}`]
      }`}
    >
      {text}
    </button>
  );
};

export default Buttons;
