import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import Btn from './Components/button.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './Components/navbar.jsx'
import Batch from './Components/props.jsx'


createRoot(document.getElementById('leaf')).render(
  < >
  <Navbar />
  <div className="container row text-align-center ms-4">

  <h1 className='title'>Hello react</h1>
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. </p>
  <Btn className="btn" />
  </div>
  <hr /> 
  </>

)
createRoot(document.getElementById('root')).render(
  <>
    <StrictMode >
      <div className="form">

        <App.App />
        <App.Apps />
      </div>
    </StrictMode>
    <Batch /> 
  </>
)