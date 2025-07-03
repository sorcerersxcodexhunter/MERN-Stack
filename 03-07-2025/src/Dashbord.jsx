
import { Link } from 'react-router-dom';
import './dashbord.css'

export default function Dashbord() {
  return (
    <>
    <div>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
  <div className="container-fluid">
    <Link className="navbar-brand" to="/">MyApp</Link>
    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li className="nav-item">
          <Link className="nav-link" to="/home">Home</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/">Login</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/about">About</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/register">Register</Link>
        </li>
      </ul>
      <form className="d-flex" role="search" style={{marginLeft: '1rem'}}>
        <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
      </form>
    </div>
  </div>
    </nav>
    </div>
    </>
  )
}
