import { Link } from 'react-router-dom';

import Form from './Component/Form';   


function Login() {
  
  return (
    <div>
      <h1>Login</h1>
      <Form />
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link to="/register" className="link">Register</Link>
      </div>
    </div>
  )
}

export default Login

