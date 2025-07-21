import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import SearchBar from './shared/SearchBar'
import { FaBookmark, FaRegBookmark, FaMapMarkerAlt, FaBuilding, FaClock, FaSearch, FaGlobe, FaDatabase, FaSpinner } from 'react-icons/fa'
import { loadingStatus } from '../redux/feature/AuthSlice.jsx'
import { user_api_key } from './shared/util.js'
import { Form, Button, Badge, Alert, Spinner, Card, Row, Col } from 'react-bootstrap'
import useBookmarks from '../hooks/useBookmarks.js'

function FindJobs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)
  const [searchMode, setSearchMode] = useState('internal') 
  const [location, setLocation] = useState('') 
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [availableCompanies, setAvailableCompanies] = useState([])
  const [externalSearchLoading, setExternalSearchLoading] = useState(false)
  
  const dispatch = useDispatch()
  const { loading } = useSelector(state => state.auth)
  const userData = useSelector(state => state.auth.user)

  // Use the custom bookmark hook
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks()

  
  useEffect(() => {
    loadAvailableCompanies()
  }, [])

  const loadAvailableCompanies = async () => {
    try {
      const response = await axios.get(`${user_api_key}/external/companies`)
      if (response.data.success) {
        setAvailableCompanies(response.data.companies)
      }
    } catch (error) {
      
    }
  }

  const handleInternalSearch = async (query, page = 1) => {
    
    
    try {
      const response = await axios.get(`${user_api_key}/jobs/search?q=${encodeURIComponent(query)}&page=${page}&limit=10`, {
        withCredentials: true
      })
      
      if (response.data.status === 'success') {
        setSearchResults(response.data.jobs)
        setTotalJobs(response.data.totalJobs)
        setTotalPages(response.data.totalPages)
        setCurrentPage(response.data.currentPage)
        setHasSearched(true)
      } else {
      
        const fallbackResponse = await axios.get(`${user_api_key}/jobs/all-jobs`, {
          withCredentials: true
        })
        
        if (fallbackResponse.data.status === 'success') {
          const allJobs = fallbackResponse.data.jobs
          const filteredJobs = allJobs.filter(job => 
            job.title.toLowerCase().includes(query.toLowerCase()) ||
            job.company.toLowerCase().includes(query.toLowerCase()) ||
            job.location.toLowerCase().includes(query.toLowerCase()) ||
            job.type.toLowerCase().includes(query.toLowerCase()) ||
            job.technology.some(tech => tech.toLowerCase().includes(query.toLowerCase())) ||
            job.Details?.discription?.toLowerCase().includes(query.toLowerCase())
          )
          
          setSearchResults(filteredJobs)
          setTotalJobs(filteredJobs.length)
          setTotalPages(1)
          setCurrentPage(1)
          setHasSearched(true)
        }
      }
    } catch (error) {
      
      setSearchResults([])
      setHasSearched(true)
    }
  }

  const handleExternalSearch = async (query) => {
    
    
    setExternalSearchLoading(true)
    
    
    
    setSearchResults([])
    setHasSearched(false)
    
    const payload = {
      searchTerm: query,
      location: location && location.trim() !== '' ? location : undefined,
      userResume: '',
      userProfile: {
        experienceLevel: '', 
        preferredJobType: '', 
        skills: [], 
      },
    };
    
    
    
    try {
      
      const response = await axios.post(`${user_api_key}/external/search-jobs`, payload, {
        withCredentials: true,
        timeout: 90000 
      })
      
      
      
      
      
      if (response.data.success) {
        
        
        if (response.data.data.isGuidance) {
          
          
          
          
          
          alert(`${response.data.message}\n\nSuggestions:\n${response.data.data.suggestions.join('\n')}`);
          
          setSearchResults([])
          setTotalJobs(0)
          setTotalPages(0)
          setCurrentPage(1)
          setHasSearched(true)
          
          return;
        }
        
        
        
        
        
        
        if (response.data.data.isAIGenerated) {
          
          
        }
        
        const externalJobs = response.data.data.jobs.map((job, index) => ({
          ...job,
          _id: job._id || `external_${Date.now()}_${index}`,
          isExternal: true,
          isAIGenerated: true,
          isFallback: false,
          technology: job.skills || [],
          Details: {
            discription: job.description,
            postedIn: job.postedDate
          }
        }));

        setSearchResults(externalJobs);
        setTotalJobs(externalJobs.length);
        setTotalPages(1);
        setCurrentPage(1);
        setHasSearched(true);
      }
    } catch (error) {
      let errorMessage = '';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += 'Please check your connection and try again.';
      }
      alert(errorMessage);
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setExternalSearchLoading(false);
    }
  }

  const handleSearch = async (query, page = 1) => {
    if (!query.trim()) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    dispatch(loadingStatus(true))

    try {
      if (searchMode === 'internal') {
        await handleInternalSearch(query, page)
      } else {
        await handleExternalSearch(query)
      }
    } catch (error) {
      
      setSearchResults([])
      setHasSearched(true)
    } finally {
      setIsSearching(false)
      dispatch(loadingStatus(false))
    }
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      handleSearch(searchTerm, page)
    }
  }

  const getJobTypeBadgeVariant = (type) => {
    const variants = {
      'Full-Time': 'success',
      'Part-Time': 'info',
      'Contract': 'warning',
      'Freelance': 'primary',
      'Internship': 'secondary',
      'Remote': 'dark',
      'Hybrid': 'light',
      'On-site': 'outline-primary'
    }
    return variants[type] || 'secondary'
  }

  return (
    (() => {
      
      
      
      
      
      
      
      
      return null
    })(),
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="text-center mb-4">
            <h2 className="mb-3">Find Your Dream Job</h2>
            <p className="text-muted">Search through internal database or scrape fresh jobs from the web</p>
          </div>
          
          {/* Search Mode Toggle */}
          <Card className="mb-4">
            <Card.Body>
              <div className="row align-items-center">
                <div className="col-md-4">
                  <Form.Label className="fw-bold">
                    <FaDatabase className="me-2" />
                    Search Mode:
                  </Form.Label>
                  <Form.Select 
                    value={searchMode} 
                    onChange={(e) => {
                      setSearchMode(e.target.value)
                      setSearchResults([]) 
                      setHasSearched(false)
                      setSearchTerm('')
                    }}
                    className="mb-3"
                  >
                    <option value="internal">
                      Internal Database
                    </option>
                    <option value="external">
                      External  (AI )
                    </option>
                  </Form.Select>
                </div>
                
                {searchMode === 'external' && (
                  <>
                    <div className="col-md-4">
                      <Form.Label className="fw-bold">Location:</Form.Label>
                      <Form.Select 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)}
                        className="mb-3"
                      >
                        <option value="">Any Location (Global Search)</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Germany">Germany</option>
                        <option value="India">India</option>
                        <option value="Remote">Remote</option>
                      </Form.Select>
                    </div>
                    
                    <div className="col-md-4">
                      <Form.Label className="fw-bold">Target Companies (Optional):</Form.Label>
                      <Form.Select 
                        multiple 
                        value={selectedCompanies} 
                        onChange={(e) => setSelectedCompanies([...e.target.selectedOptions].map(o => o.value))}
                        className="mb-3"
                        style={{ height: '80px' }}
                      >
                        {availableCompanies.map(company => (
                          <option key={company.id} value={company.name}>
                            {company.name}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  </>
                )}
              </div>
              
              {searchMode === 'external' && (
                <Alert variant="info" className="mb-0">
                  <FaGlobe className="me-2" />
                  External search will search fresh job data from the web and enhance it using AI. 
                  This may take 30-60 seconds to complete.
                </Alert>
              )}
            </Card.Body>
          </Card>
          
          <SearchBar 
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={(query) => handleSearch(query)}
            placeholder={
              searchMode === 'internal' 
                ? "Search internal database..." 
                : "Search anything job-related (e.g., 'Python', 'Remote work', 'AI jobs', 'Startup', 'High paying')..."
            }
          />
          
          {searchMode === 'external' && (
            <div className="alert alert-success small mb-3">
              <strong> Dynamic AI Search:</strong>
              <ul className="mb-0 mt-2">
                <li><strong>Technologies:</strong> "Python", "React", "JavaScript", "AI", "Machine Learning"</li>
                <li><strong>Job Types:</strong> "Remote work", "Part-time", "Freelance", "Contract"</li>
                <li><strong>Experience:</strong> "Entry level", "Senior", "Junior developer", "Lead engineer"</li>
                <li><strong>Industries:</strong> "Startup", "FinTech", "Healthcare", "Gaming", "E-commerce"</li>
                <li><strong>Casual Terms:</strong> "High paying jobs", "Cool companies", "Dream job", "New grad"</li>
                <li><strong>Combinations:</strong> "Remote Python startup", "Entry level data science"</li>
              </ul>
            </div>
          )}
          
          {(isSearching || externalSearchLoading) && (
            <div className="text-center mt-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">
                {searchMode === 'external' 
                  ? "Scraping job sites and enhancing with AI..." 
                  : "Searching internal database..."
                }
              </p>
              {searchMode === 'external' && (
                <small className="text-muted">This may take up to 60 seconds</small>
              )}
            </div>
          )}

          {hasSearched && !isSearching && !externalSearchLoading && (
            (() => {
              
              
              
              
              
              return null
            })(),
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>
                  {searchMode === 'external' ? <FaGlobe className="me-2" /> : <FaDatabase className="me-2" />}
                  {searchMode === 'external' ? 'Web Scraped' : 'Internal'} Results for "{searchTerm}"
                  {searchMode === 'external' && searchResults.length > 0 && (
                    searchResults[0].isFallback || 
                    searchResults[0].isAIGenerated || 
                    searchResults[0]._id?.includes('ai_fallback') || 
                    searchResults[0]._id?.includes('ai_unique')
                  ) && (
                    <span className="badge bg-warning ms-2">
                      
                      
                    </span>
                  )}
                  {searchMode === 'external' && searchResults.length > 0 && (
                    !searchResults[0].isFallback && 
                    !searchResults[0].isAIGenerated && 
                    searchResults[0].isRealScraping
                  ) && (
                    <span className="badge bg-success ms-2">
                      <i className="fas fa-globe me-1"></i>
                      Real Scraping
                    </span>
                  )}
                </h5>
                <Badge bg="primary">{totalJobs} jobs found</Badge>
              </div>

              {searchResults.length === 0 ? (
                (() => {
                  
                  
                  return null
                })(),
                <div className="text-center py-5">
                  <FaSearch size={48} className="text-muted mb-3" />
                  <h4 className="text-muted">No jobs found</h4>
                  <p className="text-muted">
                    {searchMode === 'external' 
                      ? "Try different search terms or check your internet connection" 
                      : "Try adjusting your search terms or filters"
                    }
                  </p>
                </div>
              ) : (
                (() => {
                  
                  
                  return null
                })(),
                <>
                  <div className="row">
                    {searchResults.map((job, index) => {
                      
                      
                      
                      const createJobKey = (job, index, mode) => {
                        const timestamp = Date.now();
                        const random = Math.random().toString(36).substr(2, 9);
                        
                        if (job.isExternal) {
                          
                          const baseKey = job.originalUrl || 
                                         job.url || 
                                         `${job.title || 'job'}-${job.company || 'company'}-${job.location || 'location'}`;
                          return `ext-${baseKey}-${index}-${timestamp}-${random}`.replace(/[^a-zA-Z0-9-_]/g, '_');
                        } else {
                          return `int-${job._id || `${job.title || 'job'}-${job.company || 'company'}-${index}-${timestamp}-${random}`}`;
                        }
                      };
                      
                      const safeKey = createJobKey(job, index, searchMode);
                      
                      
                      try {
                        const jobCard = (
                          <div key={safeKey} className="col-md-6 col-xl-4 mb-4">
                            <div className="job-card modern-card h-100">
                              <div className="job-card-header">
                                <div className="job-meta">
                                  <span className="job-posted-date">
                                    <i className="fas fa-calendar-alt"></i>
                                    {new Date(job.Details?.postedIn || job.postedDate || Date.now()).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </span>
                                  <div className="job-actions">
                                    {job.isExternal && (
                                      <span className={`job-source-badge ${job.isFallback ? 'fallback' : 'external'}`}>
                                        <i className={`fas ${job.isFallback ? 'fa-robot' : 'fa-globe'}`}></i>
                                        {job.isFallback ? 'AI Fallback' : 'External'}
                                      </span>
                                    )}
                                    <button
                                      className="bookmark-btn"
                                      onClick={() => toggleBookmark(job._id)}
                                      title={isBookmarked(job._id) ? 'Remove bookmark' : 'Add bookmark'}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        padding: 0,
                                        marginLeft: '8px',
                                        color: isBookmarked(job._id) ? '#FFD700' : '#888', // Gold for bookmarked, gray for not
                                        fontSize: '1.5rem',
                                        transition: 'color 0.2s'
                                      }}
                                    >
                                      <i className={isBookmarked(job._id) ? 'fas fa-star' : 'far fa-star'}></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="job-card-body">
                                <div className="job-title-section">
                                  <h3 className="job-title">{job.title || 'Job Title Not Available'}</h3>
                                  <div className="job-company-info">
                                    <span className="job-company">
                                      <i className="fas fa-building"></i>
                                      {job.company || 'Company Not Available'}
                                    </span>
                                    <span className="job-location">
                                      <i className="fas fa-map-marker-alt"></i>
                                      {job.location || 'Location Not Available'}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="job-details-section">
                                  <div className="job-badges">
                                    <span className={`job-type-badge ${(job.type || job.jobType || 'Full-time').toLowerCase().replace('-', '')}`}>
                                      <i className="fas fa-briefcase"></i>
                                      {job.type || job.jobType || 'Full-time'}
                                    </span>
                                    <span className="job-salary-badge">
                                      <i className="fas fa-dollar-sign"></i>
                                      {job.salary || job.salaryRange || 'Competitive'}
                                    </span>
                                    {job.experienceLevel && (
                                      <span className="job-experience-badge">
                                        <i className="fas fa-user-graduate"></i>
                                        {job.experienceLevel}
                                      </span>
                                    )}
                                    {job.companySize && (
                                      <span className="job-company-size-badge">
                                        <i className="fas fa-users"></i>
                                        {job.companySize}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {job.industry && (
                                    <div className="job-industry-section">
                                      <span className="industry-label">
                                        <i className="fas fa-industry"></i>
                                        {job.industry}
                                      </span>
                                    </div>
                                  )}
                                  
                                  <div className="job-skills-section">
                                    <p className="skills-label">
                                      <i className="fas fa-tools"></i>
                                      Skills Required:
                                    </p>
                                    <div className="skills-container">
                                      {(job.technology || job.skills || []).slice(0, 4).map((tech, index) => (
                                        <span key={index} className="skill-tag">
                                          {tech}
                                        </span>
                                      ))}
                                      {(job.technology || job.skills || []).length > 4 && (
                                        <span className="skill-tag more-skills">
                                          +{(job.technology || job.skills || []).length - 4} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {job.isExternal && job.requirements && (
                                    <div className="job-requirements-section">
                                      <p className="requirements-label">
                                        <i className="fas fa-clipboard-check"></i>
                                        Key Requirements:
                                      </p>
                                      <ul className="requirements-list">
                                        {job.requirements.slice(0, 2).map((req, index) => (
                                          <li key={index}>{req}</li>
                                        ))}
                                        {job.requirements.length > 2 && (
                                          <li className="more-requirements">
                                            +{job.requirements.length - 2} more requirements
                                          </li>
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {job.benefits && job.benefits.length > 0 && (
                                    <div className="job-benefits-section">
                                      <p className="benefits-label">
                                        <i className="fas fa-star"></i>
                                        Key Benefits:
                                      </p>
                                      <div className="benefits-container">
                                        {job.benefits.slice(0, 3).map((benefit, index) => (
                                          <span key={index} className="benefit-tag">
                                            {benefit}
                                          </span>
                                        ))}
                                        {job.benefits.length > 3 && (
                                          <span className="benefit-tag more-benefits">
                                            +{job.benefits.length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {job.workEnvironment && (
                                    <div className="job-environment-section">
                                      <p className="environment-label">
                                        <i className="fas fa-home"></i>
                                        Work Environment:
                                      </p>
                                      <p className="environment-description">
                                        {job.workEnvironment.substring(0, 100)}
                                        {job.workEnvironment.length > 100 ? '...' : ''}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {(job.Details?.discription || job.description) && (
                                    <div className="job-description-section">
                                      <p className="job-description">
                                        {(job.Details?.discription || job.description).substring(0, 120)}
                                        {(job.Details?.discription || job.description).length > 120 ? '...' : ''}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="job-card-footer">
                                <div className="job-actions-row">
                                  {(job.originalUrl || job.applyUrl || job.jobBoardUrl || job.link) && (
                                    <div className="btn-group" role="group">
                                      {job.originalUrl && (
                                        <a 
                                          className="btn btn-outline-primary btn-sm"
                                          href={job.originalUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          onClick={(e) => {
                                            
                                          }}
                                          title="Company Career Page"
                                        >
                                          <i className="fas fa-building"></i>
                                          Career Page
                                        </a>
                                      )}
                                      {job.applyUrl && job.applyUrl !== job.originalUrl && (
                                        <a 
                                          className="btn btn-primary btn-sm"
                                          href={job.applyUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          onClick={(e) => {
                                            
                                          }}
                                          title="Apply Directly"
                                        >
                                          <i className="fas fa-paper-plane"></i>
                                          Apply Now
                                        </a>
                                      )}
                                      {job.jobBoardUrl && (
                                        <a 
                                          className="btn btn-outline-secondary btn-sm"
                                          href={job.jobBoardUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          onClick={(e) => {
                                            
                                          }}
                                          title="View on Job Board"
                                        >
                                          <i className="fas fa-search"></i>
                                          Job Board
                                        </a>
                                      )}
                                      {job.link && job.link !== job.originalUrl && job.link !== job.applyUrl && (
                                        <a 
                                          className="btn btn-outline-info btn-sm"
                                          href={job.link} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          onClick={(e) => {
                                            
                                          }}
                                          title="Original Link"
                                        >
                                          <i className="fas fa-link"></i>
                                          Original
                                        </a>
                                      )}
                                    </div>
                                  )}
                                  <button className="btn btn-primary btn-sm job-action-btn">
                                    <i className="fas fa-eye"></i>
                                    View Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );                      
                      return jobCard;
                      } catch (error) {
                        
                        
                        return null;
                      }
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav className="d-flex justify-content-center mt-4">
                      <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                        </li>
                        
                        {[...Array(totalPages)].map((_, index) => (
                          <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(index + 1)}
                            >
                              {index + 1}
                            </button>
                          </li>
                        ))}
                        
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default FindJobs
