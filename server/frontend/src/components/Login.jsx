import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { user_api_key } from './shared/util';
import axios from 'axios';
import { useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {useState} from 'react';
import { useDispatch } from 'react-redux';
import { loadingStatus, setUser } from '../redux/feature/AuthSlice.jsx';

function Login() {
  const dispatch = useDispatch();
  const [input, setInput] = useState({    
    email: '',    
    password: '',
    role: ''
  });
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  }
  
  const handelSubmit = async(e) => {
    e.preventDefault();
    try {
        dispatch(loadingStatus(true));
        const response = await axios.post(`${user_api_key}/login`, input, {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true 
        });
        if (response.data.success ) {
          toast.success(response.data.message || "Login successful!");
          localStorage.setItem('token', `Bearer ${response.data.token}`);
          
          dispatch(setUser(response.data.user));
          dispatch(loadingStatus(false));
          
          setTimeout(() => {
            navigate('/dashbord'); 
          }, 500);
        } 
    } catch (error) {
      dispatch(loadingStatus(false));
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
            <h1>Login</h1>
            
          </div>
          
          <Form onSubmit={handelSubmit}>           

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
           

            
            <div className="d-grid">
              <Button variant="primary" type="submit" size="lg">
                Login
              </Button>
            </div>

           
          </Form>
        </div>
      </div>
    </>
  )
}

export default Login