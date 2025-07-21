import BootstrapSearchBar from './shared/BootstrapSearchBar.jsx';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { user_api_key } from './shared/util';
import useBookmarks from '../hooks/useBookmarks.js';
import ModelJobs from './shared/modeljobs.jsx';

function Home() {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.user);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [totalJobs, setTotalJobs] = React.useState(0);
  const [showModelJobs, setShowModelJobs] = React.useState(false);

  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks();

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(false);

    try {
      const response = await axios.get(`${user_api_key}/jobs/search`, {
        params: {
          q: query,
          page: 1,
          limit: 50
        },
        withCredentials: true,
        timeout: 30000
      });

      if (response.data.status === 'success') {
        const mongodbJobs = response.data.jobs.map((job) => ({
          ...job,
          _id: job._id,
          applicationUrl: null,
          technology: Array.isArray(job.technology) ? job.technology : [],
          description: job.Details?.discription || 'No description available'
        }));

        setSearchResults(mongodbJobs);
        setTotalJobs(response.data.totalJobs);
        setHasSearched(true);
      } else {
        throw new Error(response.data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      let errorMessage = 'Search failed. ';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out. Please try again.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Invalid search parameters.';
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += 'Please check your connection and try again.';
      }
      
      alert(errorMessage);
      setSearchResults([]);
      setTotalJobs(0);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };
  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Welcome to JobPortal Pro</h1>
      <p className="text-center">Your one-stop solution for job searching and recruitment.</p>
      <BootstrapSearchBar 
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
      />
      
      {isSearching && (
        <div className="text-center mt-4 search-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Searching...</span>
          </div>
          <p className="mt-2">Searching for jobs...</p>
        </div>
      )}

      {hasSearched && !isSearching && (
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Search Results</h3>
            <span className="search-stats">{totalJobs} jobs found</span>
          </div>
          
          {searchResults.length > 0 ? (
            <div className="row">
              {searchResults.map((job) => (
                <div key={job._id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 shadow-sm border-0 job-card hover-shadow" style={{
                    borderLeft: '4px solid #10b981',
                  }}>
                    <div className="card-body d-flex flex-column">
                      
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <button 
                          className={`btn btn-link p-0 ms-2 bookmark-btn ${isBookmarked(job._id) ? 'bookmarked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(job._id);
                          }}
                          style={{
                            color: isBookmarked(job._id) ? '#ffc107' : '#6c757d',
                            fontSize: '1.2rem',
                            textDecoration: 'none'
                          }}
                          title={isBookmarked(job._id) ? 'Remove from bookmarks' : 'Add to bookmarks'}
                        >
                          <i className={isBookmarked(job._id) ? 'bi bi-star-fill' : 'bi bi-star'}></i>
                        </button>
                      </div>

                      {/* Job Title */}
                      <h5 className="card-title mb-2" style={{fontSize: '1.1rem', fontWeight: '600'}}>
                        {job.title}
                      </h5>

                      {/* Location */}
                      <p className="text-muted mb-2" style={{fontSize: '0.9rem'}}>
                        <i className="bi bi-geo-alt me-1"></i>
                        {job.location}
                      </p>

                      {job.technology && job.technology.length > 0 && (
                        <div className="mb-3">
                          <div className="d-flex flex-wrap gap-1">
                            {job.technology.slice(0, 3).map((skill, index) => (
                              <span key={index} className="skill-tag badge" style={{fontSize: '0.75rem'}}>
                                {skill}
                              </span>
                            ))}
                            {job.technology.length > 3 && (
                              <span className="badge bg-light text-muted" style={{fontSize: '0.75rem'}}>
                                +{job.technology.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <p className="card-text flex-grow-1" style={{fontSize: '0.9rem', lineHeight: '1.4'}}>
                        {job.Details?.discription 
                          ? (job.Details.discription.length > 120 
                              ? job.Details.discription.substring(0, 120) + '...' 
                              : job.Details.discription)
                          : job.description 
                            ? (job.description.length > 120 
                                ? job.description.substring(0, 120) + '...' 
                                : job.description)
                            : 'No description available'
                        }
                      </p>

                      <div className="mt-auto">
                        <div className="btn-group w-100 enhanced-btn-group" role="group">
                          {job.applicationUrl ? (
                            <a 
                              href={job.applicationUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-primary btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <i className="bi bi-box-arrow-up-right me-1"></i>
                              Apply
                            </a>
                          ) : (
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Job Application:\n\nTitle: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\n\nTo apply for this position, please contact the recruiter or visit the company's career page.`);
                              }}
                            >
                              <i className="bi bi-person-check me-1"></i>
                              Apply Now
                            </button>
                          )}
                          <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const jobDetails = `
Job Details:

Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Type: ${job.type || 'Not specified'}
Salary: ${job.salary || 'Not specified'}
Technologies: ${job.technology?.join(', ') || 'Not specified'}

Description: ${job.Details?.discription || job.description || 'No description available'}

Posted: ${job.Details?.postedIn ? new Date(job.Details.postedIn).toLocaleDateString() : 'Date not available'}
                              `.trim();
                              alert(jobDetails);
                            }}
                          >
                            <i className="bi bi-info-circle me-1"></i>
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-search" style={{fontSize: '3rem', color: '#6c757d'}}></i>
              <h4 className="mt-3 text-muted">No jobs found</h4>
              <p className="text-muted">Try adjusting your search terms or search for different keywords.</p>
            </div>
          )}
        </div>
      )}

      {/* Original content when no search is performed */}
      {!hasSearched && !isSearching && (
        <>
          {userData && userData.role === "student" ? (
        <div className="row justify-content-center mt-5">
          <div className="col-md-8">
            <div className="card shadow-lg border-0" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <div className="card-body text-white p-5">
                <div className="text-center mb-4">
                  <i className="bi bi-briefcase-fill" style={{fontSize: '3rem', marginBottom: '1rem'}}></i>
                  <h2 className="fw-bold">For Job Seekers</h2>
                </div>
                <p className="text-center lead mb-4">
                  Discover your dream career with our advanced job matching platform. 
                  Access thousands of opportunities tailored to your skills and aspirations.
                </p>
                <div className="row text-center mb-4">
                  <div className="col-md-4">
                    <i className="bi bi-search" style={{fontSize: '2rem'}}></i>
                    <p className="mt-2">Smart Search</p>
                  </div>
                  <div className="col-md-4">
                    <i className="bi bi-person-check" style={{fontSize: '2rem'}}></i>
                    <p className="mt-2">Perfect Match</p>
                  </div>
                  <div className="col-md-4">
                    <i className="bi bi-graph-up" style={{fontSize: '2rem'}}></i>
                    <p className="mt-2">Career Growth</p>
                  </div>
                </div>
                <div className="text-center">
                  <button 
                    className="btn btn-light btn-lg px-5 py-3" 
                    style={{borderRadius: '50px', fontWeight: 'bold'}}
                    onClick={() => navigate('/jobs')}
                  >
                    <i className="bi bi-search me-2"></i>
                    Explore Jobs Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : userData && userData.role === "recruiter" ? (
        <div className="row justify-content-center mt-5">
          <div className="col-md-8">
            <div className="card shadow-lg border-0" style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'}}>
              <div className="card-body text-white p-5">
                <div className="text-center mb-4">
                  <i className="bi bi-building" style={{fontSize: '3rem', marginBottom: '1rem'}}></i>
                  <h2 className="fw-bold">For Recruiters</h2>
                </div>
                <p className="text-center lead mb-4">
                  Find exceptional talent effortlessly. Our platform connects you with qualified candidates 
                  and streamlines your entire hiring process.
                </p>
                <div className="row text-center mb-4">
                  <div className="col-md-4">
                    <i className="bi bi-people-fill" style={{fontSize: '2rem'}}></i>
                    <p className="mt-2">Top Talent</p>
                  </div>
                  <div className="col-md-4">
                    <i className="bi bi-lightning-charge" style={{fontSize: '2rem'}}></i>
                    <p className="mt-2">Quick Hiring</p>
                  </div>
                  <div className="col-md-4">
                    <i className="bi bi-graph-up-arrow" style={{fontSize: '2rem'}}></i>
                    <p className="mt-2">Easy Management</p>
                  </div>
                </div>
                <div className="text-center">
                  <button 
                    className="btn btn-light btn-lg px-5 py-3" 
                    style={{borderRadius: '50px', fontWeight: 'bold'}}
                    onClick={() => setShowModelJobs(true)}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Post a Job
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row justify-content-center mt-5">
          <div className="col-md-10">
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card shadow-lg border-0" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                  <div className="card-body text-white p-4">
                    <div className="text-center mb-3">
                      <i className="bi bi-briefcase-fill" style={{fontSize: '2.5rem', marginBottom: '1rem'}}></i>
                      <h3 className="fw-bold">For Job Seekers</h3>
                    </div>
                    <p className="text-center mb-3">
                      Find your perfect job with our smart matching system.
                    </p>
                    <div className="text-center">
                      <button 
                        className="btn btn-light px-4 py-2" 
                        style={{borderRadius: '25px', fontWeight: 'bold'}}
                        onClick={() => navigate('/signup')}
                      >
                        Get Started
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="card shadow-lg border-0" style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'}}>
                  <div className="card-body text-white p-4">
                    <div className="text-center mb-3">
                      <i className="bi bi-building" style={{fontSize: '2.5rem', marginBottom: '1rem'}}></i>
                      <h3 className="fw-bold">For Recruiters</h3>
                    </div>
                    <p className="text-center mb-3">
                      Connect with top talent and streamline your hiring process.
                    </p>
                    <div className="text-center">
                      <button 
                        className="btn btn-light px-4 py-2" 
                        style={{borderRadius: '25px', fontWeight: 'bold'}}
                        onClick={() => navigate('/signup')}
                      >
                        Get Started
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center mt-5">
        <h4>Follow Us on Social Media</h4>
        <div className="d-flex justify-content-center">
          <a href="https://facebook.com" className="me-3"><i className="bi bi-facebook"></i></a>
          <a href="https://twitter.com" className="me-3"><i className="bi bi-twitter"></i></a> 
          <a href="https://linkedin.com" className="me-3"><i className="bi bi-linkedin"></i></a>
          <a href="https://instagram.com"><i className="bi bi-instagram"></i></a>
        </div>   
      </div>
      </>
      )}

      {/* ModelJobs Modal */}
      {showModelJobs && (
        <ModelJobs 
          show={showModelJobs} 
          onHide={() => setShowModelJobs(false)} 
          onJobPosted={(job) => {
            console.log('Job posted successfully:', job);
            setShowModelJobs(false);
          }}
        />
      )}
    </div>
  )
}

export default Home