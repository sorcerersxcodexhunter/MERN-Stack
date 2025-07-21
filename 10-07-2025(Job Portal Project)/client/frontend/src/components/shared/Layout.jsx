import { Outlet } from 'react-router-dom';
import CustomNavbar from './Navbar.jsx';

function Layout() {
  return (
    <>
      <CustomNavbar />
      
        <Outlet />
      
    </>
  );
}

export default Layout;