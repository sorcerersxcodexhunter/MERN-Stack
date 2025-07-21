import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { user_api_key } from './shared/util';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify';
import {useState} from 'react';


function SignUp() {
  const [input, setInput] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: ''
  });
  const [terms,setTerms] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  }
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      toast.error('Please select only image files');
      e.target.value = '';
      return;
    }
    setProfilePicture(file);
  }
  
  const handelSubmit = async(e) => {
    e.preventDefault();
    
    if (!terms) {
      toast.error("Please agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('fullName', input.fullName);
      formData.append('email', input.email);
      formData.append('phoneNumber', input.phoneNumber);
      formData.append('password', input.password);
      formData.append('role', input.role);
      
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }
      
      
      const responce = await axios.post(`${user_api_key}/register`, formData, {
        withCredentials: true
      });
      
      
      
      if (responce.data.success) {
        toast.success(responce.data.message || "Registration successful! Please log in to continue.");
        
        setTimeout(() => {
          
          navigate('/login'); 
        }, 500);
      } else {
        toast.error(responce.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.error || error.response.data.message;
        toast.error(errorMessage);
      } else if (error.message) {
        toast.error(`Network Error: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  }
  return (
    <>
      
      <div className="auth-container">
        <div className="auth-card fade-in-up">
          <div className="auth-header">
            <h1>Sign Up</h1>
            <p>Join our job portal and find your dream career</p>
          </div>
          
          <Form onSubmit={handelSubmit}>
            <Form.Group className="mb-3" controlId="formBasicName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control 
                type="text" 
                name="fullName"
                value={input.fullName}
                onChange={handleChange}
                placeholder="Enter your full name" 
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email Address</Form.Label>
              <Form.Control 
                type="email" 
                name="email"
                value={input.email}
                onChange={handleChange}
                placeholder="Enter your email" 
                required
              />
              <Form.Text className="text-muted">
                We'll never share your email with anyone else.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPhone">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control 
                type="tel" 
                name="phoneNumber"
                value={input.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your mobile number"
                required
              />        
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                name="password"
                value={input.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicRole">
              <Form.Label>Role</Form.Label>
              <Form.Select name='role' value={input.role} onChange={handleChange} required>
                <option value="">Select your role</option>
                <option value="student">Student</option>
                <option value="recruiter">Recruiter</option>      
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicProfilePicture">
              <Form.Label>Profile Picture (Optional)</Form.Label>
              <div className="d-flex justify-content-center align-items-center gap-3">
                <Button 
                  variant="outline-primary" 
                  onClick={() => document.getElementById('fileInput').click()}
                  type="button"
                >
                  Choose Image
                </Button>
                
              </div>
              <input
                id="fileInput"
                type="file"
                name="profilePicture"
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <Form.Text className="text-muted d-flex justify-content-center">
                Only image files are allowed
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-4" controlId="formBasicCheckbox">
              <Form.Check 
                type="checkbox" 
                label="I agree to the Terms of Service and Privacy Policy"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                required
              />
            </Form.Group>
            

            <div className="d-grid">
              <Button variant="primary" type="submit" size="lg">
                Create Account
              </Button>
            </div>

            <div className="text-center mt-3">
              <span className="text-muted">Already have an account? </span>
              <a href="/login" className="text-decoration-none">Sign in</a>
            </div>
          </Form>
        </div>
      </div>
    </>
  )
}

export default SignUp
