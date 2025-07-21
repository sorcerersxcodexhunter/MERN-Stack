import { useState, useEffect } from 'react';
import { Button, Modal, Form, Spinner } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { user_api_key } from './util';
import { setUser } from '../../redux/feature/AuthSlice.jsx';

function ViewDetails() {
  const [show, setShow] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    skills: '',
    profilePicture: null,
    resume: null
  });
  const [selectedFiles, setSelectedFiles] = useState({
    profilePicture: null,
    resume: null
  });
  const [previewUrls, setPreviewUrls] = useState({
    profilePicture: null,
    resume: null
  });

  const userData = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  
  useEffect(() => () => {
    Object.values(previewUrls).forEach(url => url && URL.revokeObjectURL(url));
  }, [previewUrls]);


  const handleFileChange = (fileType, file) => {
    if (!file) return;
    
    
    if (previewUrls[fileType]) URL.revokeObjectURL(previewUrls[fileType]);

    try {
      const fileURL = URL.createObjectURL(file);
      setSelectedFiles(prev => ({ ...prev, [fileType]: file }));
      setPreviewUrls(prev => ({ ...prev, [fileType]: fileURL }));
      setProfileData(prev => ({ ...prev, [fileType]: file }));
      toast.success(`${fileType === 'profilePicture' ? 'Profile picture' : 'Resume'} selected successfully!`);
    } catch (error) {
      toast.error('Failed to process file. Please try again.');
    }
  };

  
  const handleDownload = async (url, filename) => {
    try {
      const isBlob = url.startsWith('blob:');
      
      if (isBlob) {
       
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started!');
        return;
      }

      
      try {
        const response = await fetch(url, { credentials: 'include', mode: 'cors' });
        if (!response.ok) throw new Error('Fetch failed');
        
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(downloadUrl);
        toast.success('Download completed!');
      } catch (fetchError) {
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.info('Download started in new tab!');
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed. Please try again.');
    }
  };

  
  const renderPreview = (type) => {
    const file = selectedFiles[type];
    const url = previewUrls[type];
    if (!file || !url) return null;

    if (file.type.startsWith('image/')) {
      return <img src={url} alt="Preview" className="img-thumbnail" style={{width: '80px', height: '80px', objectFit: 'cover'}} />;
    }

    if (file.type === 'application/pdf') {
      return (
        <div className="border rounded p-2" style={{height: '200px'}}>
          <embed src={url} type="application/pdf" width="100%" height="100%" />
        </div>
      );
    }

    return (
      <div className="d-flex align-items-center">
        <i className="bi bi-file-earmark-text me-2" style={{fontSize: '2rem'}}></i>
        <div>
          <strong>{file.name}</strong>
          <br />
          <small className="text-muted">Ready to upload</small>
        </div>
      </div>
    );
  };

  
  const resetForm = () => {
    Object.values(previewUrls).forEach(url => url && URL.revokeObjectURL(url));
    setProfileData({
      fullName: '',
      email: '',
      phoneNumber: '',
      bio: '',
      skills: '',
      profilePicture: null,
      resume: null
    });
    setSelectedFiles({ profilePicture: null, resume: null });
    setPreviewUrls({ profilePicture: null, resume: null });
  };

  const handleShow = () => {
    if (!userData) {
      toast.error("Please log in to update your profile.");
      return;
    }
    
    setProfileData({
      fullName: userData.fullName || '',
      email: userData.email || '',
      phoneNumber: userData.phoneNumber || '',
      bio: userData.profile?.bio || '',
      skills: userData.profile?.skills?.join(', ') || '',
      profilePicture: null,
      resume: null
    });
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    resetForm();
  };

  const handleUpdate = async () => {
    
    if (!profileData.fullName.trim() || !profileData.email.trim() || !profileData.phoneNumber.trim()) {
      toast.error("Please fill in all required fields (Name, Email, Phone)");
      return;
    }

    if (profileData.email && !/\S+@\S+\.\S+/.test(profileData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setUpdating(true);
    
    try {
      const formData = new FormData();
      formData.append('fullName', profileData.fullName);
      formData.append('email', profileData.email);
      formData.append('phoneNumber', profileData.phoneNumber);
      formData.append('bio', profileData.bio);
      
      if (userData?.role === 'student') {
        formData.append('skills', profileData.skills);
      }
      
      if (profileData.profilePicture) {
        formData.append('profilePicture', profileData.profilePicture);
      }
      
      if (userData?.role === 'student' && profileData.resume) {
        formData.append('resume', profileData.resume);
      }
      
      const response = await axios.put(`${user_api_key}/update-profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      
      if (response.data.success) {
        toast.success('Profile updated successfully! 🎉');
        dispatch(setUser(response.data.user));
        
        
        setTimeout(() => {
          handleClose();
        }, 100);
      } else {
        toast.error(response.data.message || 'Update failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
      console.error('Update error:', error);
    } finally {
      setUpdating(false);
    }
  };

  
  const FileActions = ({ type, isSelected = false }) => {
    const file = selectedFiles[type];
    const url = previewUrls[type];
    const currentFile = userData?.profile?.[type];
    
    if (isSelected && file && url) {
      return (
        <div className="d-flex gap-2 mt-2">
          <Button variant="outline-primary" size="sm" onClick={() => window.open(url, '_blank')}>
            <i className="bi bi-eye me-1"></i> Preview
          </Button>
          <Button variant="outline-success" size="sm" onClick={() => handleDownload(url, file.name)}>
            <i className="bi bi-download me-1"></i> Download
          </Button>
        </div>
      );
    }
    
    if (!isSelected && currentFile) {
      const fileName = type === 'profilePicture' 
        ? `profile-picture-${userData.fullName || 'user'}.jpg`
        : userData.profile?.resumeOriginalName || 'resume.pdf';
        
      return (
        <div className="d-flex gap-2 mt-2">
          <Button variant="outline-primary" size="sm" onClick={() => window.open(currentFile, '_blank')}>
            <i className="bi bi-eye me-1"></i> Preview Current
          </Button>
          <Button variant="outline-success" size="sm" onClick={() => handleDownload(currentFile, fileName)}>
            <i className="bi bi-download me-1"></i> Download Current
          </Button>
        </div>
      );
    }
    
    return null;
  };

  
  const CurrentFileDisplay = ({ type }) => {
    const currentFile = userData?.profile?.[type];
    if (!currentFile) return null;
    
    if (type === 'profilePicture') {
      return (
        <div className="mt-2">
          <img src={currentFile} alt="Current Profile" className="img-thumbnail" 
               style={{width: '60px', height: '60px', objectFit: 'cover'}} />
          <small className="text-muted ms-2">Current profile picture</small>
        </div>
      );
    }
    
    return (
      <div className="mt-2">
        <a href={currentFile} target="_blank" rel="noopener noreferrer" 
           className="btn btn-sm btn-outline-secondary me-2">
          <i className="bi bi-file-earmark-pdf me-1"></i>
          {userData.profile?.resumeOriginalName || 'Current Resume'}
        </a>
      </div>
    );
  };

  return (
    <>
      <Button variant="outline-primary" onClick={handleShow} className="mb-3">
        <i className="bi bi-pencil-square me-2"></i>
        Update Profile
      </Button>

      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Update Profile</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Form>
            
            <Form.Group className="mb-3">
              <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your full name"
                value={profileData.fullName}
                onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter your phone number"
                value={profileData.phoneNumber}
                onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={userData?.role === 'recruiter' ? 'Tell us about your company...' : 'Tell us about yourself...'}
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              />
            </Form.Group>
            
            
            {userData?.role === 'student' && (
              <Form.Group className="mb-3">
                <Form.Label>Skills</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="React, Node.js, Python..."
                  value={profileData.skills}
                  onChange={(e) => setProfileData({...profileData, skills: e.target.value})}
                />
              </Form.Group>
            )}
            
            
            <Form.Group className="mb-3">
              <Form.Label>Profile Picture</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('profilePicture', e.target.files[0])}
              />
              
              {selectedFiles.profilePicture ? (
                <div className="mt-2">
                  <div className="mb-2">{renderPreview('profilePicture')}</div>
                  <small className="text-muted d-block mb-2">Selected profile picture</small>
                  <FileActions type="profilePicture" isSelected={true} />
                </div>
              ) : (
                <>
                  <CurrentFileDisplay type="profilePicture" />
                  <FileActions type="profilePicture" isSelected={false} />
                </>
              )}
            </Form.Group>
            
            
            {userData?.role === 'student' && (
              <Form.Group className="mb-3">
                <Form.Label>Resume</Form.Label>
                <Form.Control
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange('resume', e.target.files[0])}
                />
                
                {selectedFiles.resume ? (
                  <div className="mt-2">
                    <div className="mb-2">{renderPreview('resume')}</div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-file-earmark-pdf me-2" style={{fontSize: '1.5rem'}}></i>
                      <div>
                        <strong>{selectedFiles.resume.name}</strong>
                        <br />
                        <small className="text-muted">
                          Selected resume ({(selectedFiles.resume.size / 1024 / 1024).toFixed(2)} MB)
                        </small>
                      </div>
                    </div>
                    <FileActions type="resume" isSelected={true} />
                  </div>
                ) : (
                  <>
                    <CurrentFileDisplay type="resume" />
                    <FileActions type="resume" isSelected={false} />
                  </>
                )}
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate} disabled={updating}>
            {updating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              'Update Profile'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ViewDetails;