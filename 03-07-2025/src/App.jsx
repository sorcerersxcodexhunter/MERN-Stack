import { useState, useEffect, useRef, createContext } from 'react';
// import { CountProvider } from './CountProvider';
import Home from './Home';
import About from './About';
import Login from './Login';
import {BrowserRouter,Route,Routes} from 'react-router-dom';
import Form from './Component/Form';
import Dashbord from './Dashbord';
import './global.css';
import Register from './Register';

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/" element={<Login />} />
        <Route path="/dashbord" element={<Dashbord />} />
        <Route path="/register" element={<Register />} />
        </Routes>
    </BrowserRouter>
  );
}
export default App;
