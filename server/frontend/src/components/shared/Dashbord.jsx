import {useSelector} from 'react-redux';
import { Spinner } from 'react-bootstrap';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ViewDetails from './model.jsx';
import ModelJobs from './modeljobs.jsx';
import ModeleditJobs from './modeleditJobs.jsx';
import { user_api_key } from './util';
import bookmarkService from '../../services/bookmarkService.js';

function Dashbord() {
  const userData = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <p>No user data available. Please login again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {userData.role === 'student' ? (
        <StudentDashboard userData={userData} />
      ) : (
        <RecruiterDashboard userData={userData} />
      )}
    </div>
  );
}


function StudentDashboard({ userData }) {
  const navigate = useNavigate();
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllBookmarks, setShowAllBookmarks] = useState(false);

  // Get user ID for bookmark management
  const userId = userData?.id || userData?._id || 'guest';

  useEffect(() => {
    const fetchBookmarkedJobs = async () => {
      try {
        setLoading(true);
        
        // Get user-specific bookmarks from the centralized service
        const userBookmarks = bookmarkService.getBookmarks(userId);
        const bookmarkedIds = [...userBookmarks];
        
        console.log('Dashboard: Loading bookmarks for user:', userId, bookmarkedIds);
        
        if (bookmarkedIds.length === 0) {
          setBookmarkedJobs([]);
          setLoading(false);
          return;
        }

        // Fetch all jobs from backend
        const response = await axios.get(`${user_api_key}/jobs/all-jobs`, { withCredentials: true });
        const jobsData = response.data.jobs || response.data;

        // Filter jobs that are bookmarked by this user
        const bookmarked = jobsData.filter(job => bookmarkedIds.includes(job._id));
        setBookmarkedJobs(bookmarked);
        
        console.log('Dashboard: Found bookmarked jobs:', bookmarked.length);
        
      } catch (error) {
        console.error('Error fetching bookmarked jobs:', error);
        setBookmarkedJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkedJobs();
  }, [userId]);

  // Function to toggle bookmark and refresh the list
  const toggleBookmark = (jobId) => {
    const updatedBookmarks = bookmarkService.toggleBookmark(jobId, userId);
    console.log('Dashboard: Toggled bookmark for job:', jobId, 'User:', userId);
    
    // Remove the job from current list if it was unbookmarked
    setBookmarkedJobs(prev => prev.filter(job => updatedBookmarks.has(job._id)));
  };

  // Function to refresh bookmarked jobs
  const refreshBookmarks = () => {
    const fetchBookmarkedJobs = async () => {
      try {
        setLoading(true);
        
        const userBookmarks = bookmarkService.getBookmarks(userId);
        const bookmarkedIds = [...userBookmarks];
        
        if (bookmarkedIds.length === 0) {
          setBookmarkedJobs([]);
          setLoading(false);
          return;
        }

        const response = await axios.get(`${user_api_key}/jobs/all-jobs`, { withCredentials: true });
        const jobsData = response.data.jobs || response.data;
        const bookmarked = jobsData.filter(job => bookmarkedIds.includes(job._id));
        setBookmarkedJobs(bookmarked);
        
      } catch (error) {
        console.error('Error refreshing bookmarked jobs:', error);
        setBookmarkedJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkedJobs();
  };

  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <div className="bg-primary text-white p-4 rounded-3">
            <h2 className="mb-0">
              <i className="bi bi-person-badge me-2"></i>
              Welcome, {userData.fullName}!
            </h2>
           
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-person-gear me-2"></i>
                Profile Management
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Name:</strong> {userData.fullName}
              </div>
              <div className="mb-3">
                <strong>Email:</strong> {userData.email}
              </div>
              <div className="mb-3">
                <strong>Phone:</strong> {userData.phoneNumber || 'Not provided'}
              </div>
              <div className="mb-3">
                <strong>Bio:</strong> {userData.profile?.bio || 'Not provided'}
              </div>
              <div className="mb-3">
                <strong>Skills:</strong> {userData.profile?.skills?.join(', ') || 'Not provided'}
              </div>
              
              {userData.profile?.profilePicture && (
                <div className="mb-3">
                  <strong>Profile Picture:</strong>
                  <div className="mt-2">
                    <img 
                      src={userData.profile.profilePicture} 
                      alt="Profile" 
                      className="img-thumbnail"
                      style={{width: '80px', height: '80px', objectFit: 'cover'}}
                    />
                  </div>
                </div>
              )}
              
              {userData.profile?.resume && (
                <div className="mb-3">
                  <strong>Resume:</strong>
                  <div className="mt-2">
                    <a 
                      href={userData.profile.resume} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-secondary"
                    >
                      <i className="bi bi-file-earmark-pdf me-1"></i>
                      {userData.profile.resumeOriginalName || 'View Resume'}
                    </a>
                  </div>
                </div>
              )}
              
              <ViewDetails />
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm text-center">
                <div className="card-body">
                  <i className="bi bi-search text-primary" style={{fontSize: '2rem'}}></i>
                  <h5 className="card-title mt-3">Find Jobs</h5>
                  <p className="card-text">Search and discover new job opportunities</p>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => navigate('/jobs')}
                  >
                    Find Jobs
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm text-center">
                <div className="card-body">
                  <i className="bi bi-file-earmark-text text-success" style={{fontSize: '2rem'}}></i>
                  <h5 className="card-title mt-3">My Applications</h5>
                  <p className="card-text">Track your job applications and status</p>
                  <button className="btn btn-outline-success" onClick={()=>navigate("/applications")}>View Applications</button>
                </div>
              </div>
            </div>
          </div>

          
          <div className="card shadow-sm mt-4">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-bookmark-fill me-2"></i>
                Your Bookmarked Jobs
              </h5>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={refreshBookmarks}
                title="Refresh bookmarks"
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" />
                  <p className="mt-2 mb-0">Loading bookmarked jobs...</p>
                </div>
              ) : bookmarkedJobs.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-bookmark text-muted" style={{fontSize: '2rem'}}></i>
                  <p className="text-muted mt-2 mb-0">No bookmarked jobs yet</p>
                  <small className="text-muted">
                    Start browsing jobs and bookmark your favorites!<br/>
                    <button 
                      className="btn btn-link p-0 mt-1"
                      onClick={() => navigate('/jobs')}
                    >
                      Browse Jobs Now
                    </button>
                  </small>
                </div>
              ) : (
                <div className="row">
                  {(showAllBookmarks ? bookmarkedJobs : bookmarkedJobs.slice(0, 6)).map((job, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="border rounded p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="text-primary fw-bold mb-1">{job.title}</h6>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-success">{job.type || 'Full-Time'}</span>
                            <button
                              className="btn btn-link p-0"
                              onClick={() => toggleBookmark(job._id)}
                              style={{
                                color: '#ffc107',
                                fontSize: '1.2rem',
                                textDecoration: 'none'
                              }}
                              title="Remove from bookmarks"
                            >
                              <i className="bi bi-star-fill"></i>
                            </button>
                          </div>
                        </div>
                        <p className="mb-1 text-muted">
                          <i className="bi bi-building me-1"></i>
                          {job.company}
                        </p>
                        <p className="mb-1 text-muted">
                          <i className="bi bi-geo-alt me-1"></i>
                          {job.location}
                        </p>
                        <p className="mb-2 text-success fw-semibold">
                          <i className="bi bi-currency-rupee me-1"></i>
                          {job.salary}
                        </p>
                        {job.technology && job.technology.length > 0 && (
                          <div className="mb-2">
                            {job.technology.slice(0, 3).map((tech, techIndex) => (
                              <span key={techIndex} className="badge bg-light text-dark me-1 mb-1">
                                {tech}
                              </span>
                            ))}
                            {job.technology.length > 3 && (
                              <span className="badge bg-secondary">+{job.technology.length - 3} more</span>
                            )}
                          </div>
                        )}
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {new Date(job.createdAt).toLocaleDateString()}
                          </small>
                          <button className="btn btn-sm btn-outline-primary">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {bookmarkedJobs.length > 6 && (
                <div className="text-center mt-3">
                  <button 
                    className="btn btn-outline-secondary me-2"
                    onClick={refreshBookmarks}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                  </button>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setShowAllBookmarks(!showAllBookmarks)}
                  >
                    {showAllBookmarks ? (
                      <>
                        <i className="bi bi-eye-slash me-1"></i>
                        Show Less
                      </>
                    ) : (
                      <>
                        <i className="bi bi-eye me-1"></i>
                        View All {bookmarkedJobs.length} Bookmarks
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}


function RecruiterDashboard({ userData }) {
  const [showJobModal, setShowJobModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);
  // Session-only recently posted jobs (no persistence across login/logout)
  const [sessionPostedJobs, setSessionPostedJobs] = useState([]);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [allPostedJobs, setAllPostedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const sessionInitialized = useRef(false);

  useEffect(() => {
    if (!sessionInitialized.current && userData) {
      setSessionPostedJobs([]); // Start with empty session jobs
      sessionInitialized.current = true;
    }
    if (!userData) {
      setSessionPostedJobs([]);
      setAllPostedJobs([]);
      sessionInitialized.current = false;
    }
  }, [userData]);

  const handleShowJobModal = () => setShowJobModal(true);
  const handleCloseJobModal = () => setShowJobModal(false);

  const handleEditJob = (job) => {
    setJobToEdit(job);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setJobToEdit(null);
  };

  const handleJobUpdated = (updatedJob) => {
    setSessionPostedJobs(prev => prev.map(job => 
      job._id === updatedJob._id ? updatedJob : job
    ));
    setAllPostedJobs(prev => prev.map(job => 
      job._id === updatedJob._id ? updatedJob : job
    ));
  };

  const handleJobPosted = (newJob) => {
    setSessionPostedJobs(prev => [newJob, ...prev]);
    if (showAllJobs) {
      setAllPostedJobs(prev => [newJob, ...prev]);
    }
  };

  const handleManageJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${user_api_key}/jobs/my-jobs`, {
        withCredentials: true
      });
      if (response.data.status === 'success') {
        setAllPostedJobs(response.data.jobs);
        setShowAllJobs(true);
      }
    } catch (error) {
      console.error('Error fetching posted jobs:', error);
      toast.error('Failed to fetch your posted jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRecent = () => {
    setShowAllJobs(false);
  };

  const handelDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }
    try {
      const response = await axios.delete(`${user_api_key}/jobs/delete-job/${jobId}`, {
        withCredentials: true
      });
      if (response.data.status === 'success') {
        setAllPostedJobs(prev => prev.filter(job => job._id !== jobId));
        setSessionPostedJobs(prev => prev.filter(job => job._id !== jobId));
        toast.success("Job deleted successfully");
      } else {
        toast.error(response.data.message || "Failed to delete job");
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      if (error.response?.status === 403) {
        toast.error("You are not authorized to delete this job");
      } else {
        toast.error(error.response?.data?.message || "An error occurred while deleting the job");
      }
    }
  };

  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <div className="bg-success text-white p-4 rounded-3">
            <h2 className="mb-0">
              <i className="bi bi-building me-2"></i>
              Welcome, {userData.fullName}!
            </h2>
            
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-person-gear me-2"></i>
                Profile Management
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Name:</strong> {userData.fullName}
              </div>
              <div className="mb-3">
                <strong>Email:</strong> {userData.email}
              </div>
              <div className="mb-3">
                <strong>Phone:</strong> {userData.phoneNumber || 'Not provided'}
              </div>
              <div className="mb-3">
                <strong>Bio:</strong> {userData.profile?.bio || 'Not provided'}
              </div>
              
              {userData.profile?.profilePicture && (
                <div className="mb-3">
                  <strong>Profile Picture:</strong>
                  <div className="mt-2">
                    <img 
                      src={userData.profile.profilePicture} 
                      alt="Profile" 
                      className="img-thumbnail"
                      style={{width: '80px', height: '80px', objectFit: 'cover'}}
                    />
                  </div>
                </div>
              )}
              
              <ViewDetails />
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm text-center">
                <div className="card-body">
                  <button className="btn btn-link text-success p-0" onClick={handleShowJobModal}>
                    <i className="bi bi-plus-circle-fill text-success" style={{fontSize: '2rem'}}></i>
                  </button>
                  <h5 className="card-title mt-3">Post New Job</h5>
                  <p className="card-text">Create job listings to attract top talent</p>
                 
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm text-center">
                <div className="card-body">
                  <button className="btn btn-link text-success p-0" onClick={handleManageJobs}>
                  <i className="bi bi-list-check text-warning" style={{fontSize: '2rem'}}></i>
                  </button>
                  <h5 className="card-title mt-3">Manage Jobs</h5>
                  <p className="card-text">View and manage your posted jobs</p>
                  
                </div>
              </div>
            </div>
          </div>

          
          {(sessionPostedJobs.length > 0 || showAllJobs) && (
            <div className="card shadow-sm mt-4">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-briefcase me-2"></i>
                  {showAllJobs ? 'All Posted Jobs' : 'Recently Posted Jobs'}
                  {!showAllJobs && sessionPostedJobs.length > 0 && (
                    <small className="text-muted ms-2">({sessionPostedJobs.length} in this session)</small>
                  )}
                </h5>
                {showAllJobs && (
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleBackToRecent}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Recent
                  </button>
                )}
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" />
                    <p className="mt-2 mb-0">Loading jobs...</p>
                  </div>
                ) : (
                  <>
                    {showAllJobs ? (
                      allPostedJobs.length === 0 ? (
                        <div className="text-center py-4">
                          <i className="bi bi-briefcase text-muted" style={{fontSize: '2rem'}}></i>
                          <p className="text-muted mt-2 mb-0">No jobs posted yet</p>
                          <small className="text-muted">Start by posting your first job!</small>
                        </div>
                      ) : (
                        <div className="row">
                          {allPostedJobs.map((job, index) => (
                            <div key={job._id || index} className="col-md-6 mb-3">
                              <div className="border rounded p-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6 className="text-success fw-bold mb-1">{job.title}</h6>
                                  <span className="badge bg-primary">{job.type || 'Full-Time'}</span>
                                </div>
                                <p className="mb-1 text-muted">
                                  <i className="bi bi-building me-1"></i>
                                  {job.company}
                                </p>
                                <p className="mb-1 text-muted">
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {job.location}
                                </p>
                                <p className="mb-2 text-success fw-semibold">
                                  <i className="bi bi-currency-rupee me-1"></i>
                                  {job.salary}
                                </p>
                                {job.technology && job.technology.length > 0 && (
                                  <div className="mb-2">
                                    {job.technology.slice(0, 3).map((tech, techIndex) => (
                                      <span key={techIndex} className="badge bg-light text-dark me-1 mb-1">
                                        {tech}
                                      </span>
                                    ))}
                                    {job.technology.length > 3 && (
                                      <span className="badge bg-secondary">+{job.technology.length - 3} more</span>
                                    )}
                                  </div>
                                )}
                                <div className="d-flex justify-content-between align-items-center">
                                  <small className="text-muted">
                                    <i className="bi bi-clock me-1"></i>
                                    {new Date(job.Details?.postedIn || job.createdAt).toLocaleDateString()}
                                  </small>
                                  <div>
                                    <button 
                                      className="btn btn-sm btn-outline-warning me-2"
                                      onClick={() => handleEditJob(job)}
                                    >
                                      <i className="bi bi-pencil me-1"></i>
                                      Edit
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => handelDeleteJob(job._id)}
                                    >
                                      <i className="bi bi-trash me-1"></i>
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      sessionPostedJobs.length === 0 ? (
                        <div className="text-center py-4">
                          <i className="bi bi-briefcase text-muted" style={{fontSize: '2rem'}}></i>
                          <p className="text-muted mt-2 mb-0">No jobs posted in this session</p>
                          <small className="text-muted">
                            Jobs posted in this session will appear here.<br/>
                            Use "Manage Jobs" to view all your posted jobs.
                          </small>
                        </div>
                      ) : (
                        <>
                          {sessionPostedJobs.slice(0, 3).map((job, index) => (
                            <div key={job._id || index} className="border-bottom pb-3 mb-3">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <h6 className="text-success d-flex align-items-center">
                                    {job.title}
                                    <span className="badge bg-info ms-2" style={{fontSize: '0.7rem'}}>
                                      New
                                    </span>
                                  </h6>
                                  <p className="mb-1"><strong>Company:</strong> {job.company}</p>
                                  <p className="mb-1"><strong>Location:</strong> {job.location}</p>
                                  <p className="mb-1"><strong>Salary:</strong> {job.salary}</p>
                                  <p className="mb-1"><strong>Job Type:</strong> <span className="badge bg-primary">{job.type || 'Full-Time'}</span></p>
                                  <p className="mb-0"><strong>Technologies:</strong> {Array.isArray(job.technology) ? job.technology.join(', ') : job.technology}</p>
                                </div>
                                <small className="text-muted ms-3">
                                  <i className="bi bi-clock me-1"></i>
                                  Just posted
                                </small>
                              </div>
                            </div>
                          ))}
                          {sessionPostedJobs.length > 3 && (
                            <div className="text-center">
                              <p className="text-muted">And {sessionPostedJobs.length - 3} more jobs posted in this session...</p>
                              <small className="text-muted">Use "Manage Jobs" to view and edit all your posted jobs.</small>
                            </div>
                          )}
                        </>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          
        </div>
      </div>
     
      <ModelJobs show={showJobModal} onHide={handleCloseJobModal} onJobPosted={handleJobPosted} />
      <ModeleditJobs 
        show={showEditModal} 
        onHide={handleCloseEditModal} 
        onJobPosted={handleJobUpdated}
        jobToEdit={jobToEdit}
      />
    </>
  );
}

export default Dashbord;