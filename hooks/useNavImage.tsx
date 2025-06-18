import HomeIcon from '@mui/icons-material/Home';
import FaceIcon from '@mui/icons-material/Face';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import TerminalIcon from '@mui/icons-material/Terminal';
import SmsIcon from '@mui/icons-material/Sms';

const useNavImage = (index) => {
  switch (index) {
    case 0:
      return <HomeIcon />;
    case 1:
      return <FaceIcon />;
    case 2:
      return <FolderSpecialIcon />;
    case 3:
      return <TerminalIcon />;
    case 4:
      return <SmsIcon />;
    default:
      return null;
  }
};

export default useNavImage;
