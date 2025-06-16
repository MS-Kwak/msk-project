import Buttons from '@/components/buttons';
import style from './login.module.css';
import useSvgImage from '@/hooks/useSvgImage';
import { useRouter } from 'next/navigation';

const Login = () => {
  const router = useRouter();

  return (
    <div className={style.login}>
      <Buttons
        text={useSvgImage('admin')}
        type={'WHITE'}
        type2={''}
        onClick={() => router.push('/admin/login')}
      />
    </div>
  );
};

export default Login;
