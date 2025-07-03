import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import './form.css';

export default function Form({submitlabel="Login", navigateTo="/home"}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: "",
    email: ""
  });

  function handleSubmit(e) {
    e.preventDefault();
    let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(formData.email)) {
      alert("Invalid email format");
      return;
    }

    if (submitlabel === "Login") {
      const registeredUser = location.state;
      if (
        registeredUser &&
        formData.username === registeredUser.username &&
        formData.email === registeredUser.email
      ) {
        alert("Login successful!");
        navigate('/home');
      } else {
        alert("Invalid username or email");
      }
    } else {
      alert("Registered successfully!");
      navigate(navigateTo, { state: formData });
    }
  }

  function handelchange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username:</label>
        <input 
          type="text" 
          id="username" 
          name="username"
          value={formData.username} 
          onChange={handelchange} 
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input 
          type="email" 
          id="email" 
          name="email"
          value={formData.email} 
          onChange={handelchange} 
        />
      </div>
      <button type="submit">{submitlabel}</button>
    </form>
  );
}
