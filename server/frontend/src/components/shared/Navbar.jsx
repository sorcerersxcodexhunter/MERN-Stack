import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Sidebar from "./shidebar.jsx";
import { useSelector } from 'react-redux';

function CustomNavbar() {
  const userData = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  
  return (
    <Navbar expand="lg" className="bg-white shadow-sm" sticky="top">
      <Container>
        <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer' }} className="text-gradient fw-bold">
          {userData?.role === 'recruiter' ? (
            <i className="bi bi-building-fill me-2"></i>
          ) : (
            <i className="bi bi-briefcase-fill me-2"></i>
          )}
          JobPortal Pro
          {userData?(userData.role === "student" ? (
          <span className="student-portal" >Student Portal</span>) : (
          <span className="recruiter-portal" >Recruiter Portal</span>
          )) : null}
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto d-flex align-items-center">
            <Nav.Link onClick={() => navigate('/')} className="fw-medium">
              Home
            </Nav.Link>
            {userData && userData.role === "student" ? (
              <Nav.Link onClick={() => navigate('/jobs')} className="fw-medium">
                Find Jobs
              </Nav.Link>
            ) : ( null
              // <Nav.Link onClick={() => navigate('/companies')} className="fw-medium">
                // Companies
              // </Nav.Link>
            )}
            <Nav.Link onClick={() => navigate('/browse')} className="fw-medium">
              Browse
            </Nav.Link>
            { userData && userData.role === "recruiter" ? (
            <Nav.Link onClick={() => navigate('/applicants')} className="fw-medium">
              Applicants
            </Nav.Link>):(null)}
            
            {userData ? (
              <div className="d-flex align-items-center ms-2">
                <Sidebar />
              </div>
            ) : (
              <div className="d-flex align-items-center">
                <Nav.Link onClick={() => navigate('/login')} className="fw-medium">
                  Sign In
                </Nav.Link>
                <Button 
                  variant="primary" 
                  size="sm"
                  className="px-3 ms-2"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar