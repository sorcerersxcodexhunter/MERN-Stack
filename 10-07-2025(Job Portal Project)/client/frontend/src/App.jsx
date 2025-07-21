import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './components/Home.jsx';
import SignUp from './components/SignUp.jsx';
import Login from './components/Login.jsx';
import Layout from './components/shared/Layout.jsx';
import Dashbord from './components/shared/Dashbord.jsx';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store.jsx';
import Browse from './components/Browse.jsx';
import FindJobs from './components/FindJobs.jsx';
import Companies from './components/Companies.jsx';
import Applicants from './components/Applicants.jsx';
import { PersistGate } from 'redux-persist/integration/react';
import Chatbot from './components/shared/Chatbot.jsx';
import Admin from './components/Admin.jsx';
import ApplicationPage from './components/Applicationpage.jsx';

const approuts = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/home",
        element: <Home />
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/signup",
        element: <SignUp />
      },
      {
        path: "/dashbord",
        element: <Dashbord />
      },
      {
        path: "/browse",
        element: <Browse />
      },
      {
        path: "/jobs",
        element: <FindJobs />
      },
      {
        path: "/companies",
        element: <Companies />
      },
      {
        path: "/applicants",
        element: <Applicants />
      },
      {
        path: "/applications",
        element: <ApplicationPage />
      },
      {
        path: "/admin",
        element: <Admin />
      }
    ]
  }
]);

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div>
          <RouterProvider router={approuts} />
          <ToastContainer position="bottom-right" />
          <Chatbot />
        </div>
      </PersistGate>
    </Provider>
  )
}

export default App