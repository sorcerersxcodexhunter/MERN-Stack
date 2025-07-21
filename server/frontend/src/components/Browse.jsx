import  { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import { Spinner, Alert, Card, Button, Container, Row, Col, Badge, Form, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { loadingStatus } from '../redux/feature/AuthSlice';
import { user_api_key } from './shared/util';
import { FaRegBookmark, FaBookmark } from 'react-icons/fa';

export default function Browse() {
  const dispatch = useDispatch();
  const { loading, user } = useSelector(state => state.auth);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        dispatch(loadingStatus(true));
        const response = await axios.get(`${user_api_key}/jobs/all-jobs`, { withCredentials: true });
        const jobsData = response.data.jobs || response.data;
        setJobs(jobsData);
        setFilteredJobs(jobsData);
        
        
        const savedBookmarks = localStorage.getItem('bookmarkedJobs');
        if (savedBookmarks) {
          setBookmarkedJobs(new Set(JSON.parse(savedBookmarks)));
        }
        
        
      } catch (err) {
        console.error('Error fetching jobs:', err);
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
        toast.error(`Failed to load jobs: ${errorMessage}`);
      } finally {
        dispatch(loadingStatus(false));
      }
    };

    fetchJobs();
  }, [dispatch]);

 
  useEffect(() => {
    if (!searchTerm) {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(job => 
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.technology?.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredJobs(filtered);
    }
  }, [searchTerm, jobs]);

  const formatSalary = (salary) => {
    if (!salary) return 'Salary not specified';
    return typeof salary === 'number' ? `₹${salary.toLocaleString()}` : salary;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getJobTypeBadgeVariant = (jobType) => {
    switch (jobType) {
      case 'Full-Time':
        return 'success';
      case 'Part-Time':
        return 'info';
      case 'Internship':
        return 'warning';
      case 'Contract':
        return 'primary';
      case 'Temporary':
        return 'secondary';
      case 'Freelance':
        return 'dark';
      case 'Volunteer':
        return 'light';
      case 'Remote':
        return 'success';
      default:
        return 'success';
    }
  };

  const toggleBookmark = (jobId) => {
    const newBookmarks = new Set(bookmarkedJobs);
    
    if (newBookmarks.has(jobId)) {
      newBookmarks.delete(jobId);
      toast.info('Job removed from bookmarks');
    } else {
      newBookmarks.add(jobId);
      toast.success('Job bookmarked successfully!');
    }
    
    setBookmarkedJobs(newBookmarks);
    
    localStorage.setItem('bookmarkedJobs', JSON.stringify(Array.from(newBookmarks)));
  };

  if (loading) {
    return (
      <Container className="my-5">
        <div className="text-center">
          <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3">Loading amazing job opportunities...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          <Alert.Heading>Unable to Load Jobs</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }
  const handleOpenModal = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  const handelApplication = async () => {
    if (!selectedJob) return;
    try {
      if (!user) {
        toast.error('You must be logged in to apply for a job.');
        return;
      }
      if (!user?.profile?.resume) {
        toast.error('No resume found in your profile. Please upload your resume in your profile settings.');
        return;
      }
      await axios.post(`${user_api_key}/apply`, {
        jobId: selectedJob._id,
        userId: user?.id || user?._id,
        resume: user.profile.resume
      },{withCredentials: true});
      toast.success('Application submitted successfully!');
      handleCloseModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(`Failed to apply: ${errorMessage}`);
    }
  };

  return (
    <Container className="my-5">
      {/* Header Section */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">
          <span className="text-primary">Job</span> Catalog
        </h1>
        <p className="lead text-muted">Discover your next career opportunity</p>
        
        
        <Row className="justify-content-center mt-4">
          <Col md={8} lg={6}>
            <InputGroup size="lg">
              <Form.Control
                type="text"
                placeholder="Search jobs by title, company, location, job type, or technology..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-2"
              />
              {/* <Button variant="primary" >
                <i className="fas fa-search"></i>
              </Button> */}
            </InputGroup>
          </Col>
        </Row>
        
        {/* Results Counter */}
        <div className="mt-3">
          <Badge bg="info" className="fs-6 px-3 py-2">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Available
          </Badge>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-search fa-3x text-muted"></i>
          </div>
          <h4 className="text-muted">No jobs found</h4>
          <p className="text-muted">Try adjusting your search criteria</p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredJobs.map(job => (
            <Col key={job._id}>
              <Card className="h-100 shadow-sm border-0 hover-card">
                <Card.Body className="d-flex flex-column">
                  
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                      <Card.Title className="text-primary fw-bold mb-1">
                        {job.title}
                      </Card.Title>
                      <Card.Subtitle className="text-muted mb-2">
                        <i className="fas fa-building me-1"></i>
                        {job.company || 'Company Name'}
                      </Card.Subtitle>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg={getJobTypeBadgeVariant(job.type)} className="px-2 py-1">
                        {job.type || 'Full-Time'}
                      </Badge>
                      <button 
                        className="btn btn-link p-0 border-0 bg-transparent"
                        onClick={() => toggleBookmark(job._id)}
                        style={{ fontSize: '1.2rem' }}
                        title={bookmarkedJobs.has(job._id) ? 'Remove bookmark' : 'Bookmark this job'}
                      >
                        {bookmarkedJobs.has(job._id) ? (
                          <FaBookmark style={{ color: '#ffc107' }} />
                        ) : (
                          <FaRegBookmark style={{ color: '#6c757d' }} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="mb-3">
                    <p className="text-muted mb-2">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {job.location || 'Location not specified'}
                    </p>
                    <p className="text-success fw-semibold mb-2">
                      
                      {formatSalary(job.salary)}
                    </p>
                    <p className="text-muted small mb-0">
                      <i className="fas fa-clock me-1"></i>
                      Posted {formatDate(job.createdAt)}
                    </p>
                  </div>

                  {/* Job Description */}
                  <Card.Text className="flex-grow-1 mb-3">
                    {job.Details?.discription && job.Details.discription.length > 120
                      ? job.Details.discription.slice(0, 120) + '...'
                      : job.Details?.discription || 'No description available'}
                  </Card.Text>

                  {/* Technologies */}
                  {job.technology && job.technology.length > 0 && (
                    <div className="mb-3">
                      <div className="d-flex flex-wrap gap-1">
                        {job.technology.slice(0, 3).map((tech, index) => (
                          <Badge key={index} bg="light" text="dark" className="px-2 py-1">
                            {tech}
                          </Badge>
                        ))}
                        {job.technology.length > 3 && (
                          <Badge bg="secondary" className="px-2 py-1">
                            +{job.technology.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Apply Button */}
                  <div className="mt-auto">
                    <Button
                      variant="primary"
                      className="w-100 fw-semibold"
                      onClick={() => handleOpenModal(job)}
                    >
                      <i className="fas fa-paper-plane me-2"></i>
                      Apply
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    {/* Resume Modal */}
    <Modal show={showModal} onHide={handleCloseModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Submit Resume</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {user?.profile?.resume && typeof user.profile.resume === 'string' && user.profile.resume.trim().toLowerCase().endsWith('.pdf') && (
          <div className="mb-3">
            <Form.Label>Resume PDF Preview</Form.Label>
            <div className="border p-2" style={{ height: '400px', overflow: 'hidden' }}>
              <iframe
                src={user.profile.resume}
                title="PDF Preview"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              ></iframe>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handelApplication}>
          Submit Application
        </Button>
      </Modal.Footer>
    </Modal>
    </Container>
  );
}
