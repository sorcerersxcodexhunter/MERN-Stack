import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Image from 'react-bootstrap/Image';
import Logout from '../Logout';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function Sidebar() {
    const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.user);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  
  if (!userData) {
    return null;
  }

  return (
    <>
      <Button variant="outline-primary" onClick={handleShow} className="circular-btn">
        {userData.profile?.profilePicture ? (
          <Image 
            src={userData.profile.profilePicture} 
            roundedCircle 
            width="50" 
            height="50"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <i className="bi bi-person-circle"></i>
        )}
      </Button>
      <Offcanvas show={show} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <div className="d-flex align-items-center">
              {userData.profile?.profilePicture ? (
                <Image 
                  src={userData.profile.profilePicture} 
                  roundedCircle 
                  width="40" 
                  height="40" 
                  className="me-2"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <i className="bi bi-person-circle me-2" style={{ fontSize: '2rem' }}></i>
              )}
              Profile
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="mb-4">
            <h5>{userData.fullName}</h5>
            <p className="text-muted">{userData.email}</p>
            <p className="text-muted">{userData.role}</p>
          </div>
          
          <div className="d-grid mb-3">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => navigate("/dashbord")}
              className="d-flex align-items-center justify-content-center"
            >
              <i className="bi bi-speedometer2 me-2"></i>
              Dashboard
            </Button>
          </div>
          
          <div className="card mb-3">
            <div className="card-body">
              <h6 className="card-title">Account Details</h6>
              <p className="card-text">
                <strong>User ID:</strong> {userData._id}
              </p>
              <p className="card-text">
                <strong>Phone:</strong> {userData.phoneNumber || 'Not provided'}
              </p>
              <p className="card-text">
                <strong>Account Created:</strong> {new Date(userData.createdAt).toLocaleDateString()}
              </p>
              <p className="card-text">
                <strong>Last Updated:</strong> {new Date(userData.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="d-grid">
            <Logout />
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Sidebar;