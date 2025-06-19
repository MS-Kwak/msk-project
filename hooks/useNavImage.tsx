import HomeIcon from '@mui/icons-material/Home';
import FaceIcon from '@mui/icons-material/Face';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import RecentActorsIcon from '@mui/icons-material/RecentActors';

const useNavImage = (index) => {
  switch (index) {
    case 0:
      return <HomeIcon />;
    case 1:
      return <FaceIcon />;
    case 2:
      return <FolderSpecialIcon />;
    case 3:
      return <IntegrationInstructionsIcon />;
    case 4:
      return <RecentActorsIcon />;
    default:
      return null;
  }
};

export default useNavImage;
