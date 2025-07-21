import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { user_api_key } from './shared/util';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../redux/feature/AuthSlice.jsx';
import bookmarkService from '../services/bookmarkService.js';

function Logout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${user_api_key}/logout`, {}, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success("Logout successful!");
        
       
        const userId = userData?.id || userData?._id;
        if (userId) {
          bookmarkService.clearUserBookmarks(userId);
          
        }
        
        // Clear all localStorage data
        localStorage.clear();
        
        dispatch(setUser(null));
        
        navigate('/login');
      } else {
        toast.error(response.data.message || "Logout failed. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while logging out. Please try again.");
    }
  };

  return (
    <Button onClick={handleLogout} variant="outline-primary" size="sm">
      Logout
    </Button>
  );
}

export default Logout;
