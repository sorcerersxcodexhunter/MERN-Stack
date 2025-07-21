import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaFileAlt, FaEye, FaComments } from 'react-icons/fa';
import { user_api_key } from './shared/util';
import { truncateText, getInitials, formatDate } from '../utils/helpers';
import ChatModel from './shared/ChatModel';


function Applicants() {
  const [jobApplicants, setJobApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatApplicant, setChatApplicant] = useState(null);
  const [chatJob, setChatJob] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const handleChat = async (applicant, job) => {
    console.log('handleChat applicant:', applicant);
    if (applicant && typeof applicant === 'object') {
      console.log('Applicant keys:', Object.keys(applicant));
    }
    setChatApplicant(applicant);
    setChatJob(job);
    setShowChat(true);
    // Chat history will be loaded by ChatModel
  };

  const handleSendMessage = async (msg) => {
    // Message sending is handled by ChatModel via Socket.IO
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${user_api_key}/recruiter/applicants`, { withCredentials: true });
      if (response.data && response.data.applicants) {
        setJobApplicants(response.data.applicants);
      } else {
        setJobApplicants([]);
        setError('No applicants found');
      }
    } catch (error) {
      setError(`Error fetching applicants: ${error.response?.data?.message || error.message}`);
      setJobApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading applicants...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Applicants</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchApplicants}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="text-primary mb-4">
        <FaUser className="me-2" />Applicants by Job
      </h2>
      {jobApplicants.length === 0 ? (
        <Alert variant="info" className="text-center">
          <FaUser size={48} className="mb-3 text-muted" />
          <h5>No Applicants Found</h5>
          <p>There are currently no applicants for your jobs.</p>
        </Alert>
      ) : (
        jobApplicants.map(({ job, applicants }) => (
          <div key={job._id} className="mb-5">
            <Card className="mb-3">
              <Card.Body>
                <Card.Title className="text-primary">{job.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {job.company} | {job.location}
                </Card.Subtitle>
                <Card.Text>
                  <strong>Applicants:</strong> {applicants.length}
                </Card.Text>
              </Card.Body>
            </Card>
            {applicants.length === 0 ? (
              <Alert variant="secondary">No applicants for this job.</Alert>
            ) : (
              <Row>
                {applicants.map(({ applicant, status, appliedAt, applicationId }) => (
                  <Col md={6} lg={4} key={applicationId} className="mb-4">
                    <Card className="hover-card h-100">
                      <Card.Body className="d-flex flex-column">
                        <div className="text-center mb-3">
                          {applicant?.profile?.profilePicture ? (
                            <img
                              src={applicant.profile.profilePicture}
                              alt={applicant.fullName}
                              className="rounded-circle mb-2"
                              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div 
                              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mb-2 mx-auto"
                              style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                            >
                              {getInitials(applicant?.fullName || '')}
                            </div>
                          )}
                        </div>
                        <Card.Title className="text-center text-primary mb-3">
                          {applicant?.fullName}
                        </Card.Title>
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <FaEnvelope className="me-2 text-muted" />
                            <small className="text-muted">{applicant?.email}</small>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <FaPhone className="me-2 text-muted" />
                            <small className="text-muted">{applicant?.phoneNumber}</small>
                          </div>
                          {applicant?.profile?.resume && (
                            <div className="d-flex align-items-center mb-2">
                              <FaFileAlt className="me-2 text-muted" />
                              <a
                                href={applicant.profile.resume}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-success px-2 py-0"
                                style={{ fontSize: '0.85rem', lineHeight: 1.5 }}
                              >
                                View Resume
                              </a>
                            </div>
                          )}
                        </div>
                        {applicant?.profile?.bio && (
                          <div className="mb-3">
                            <p className="text-muted small mb-2">
                              <strong>Bio:</strong>
                            </p>
                            <p className="text-muted small">
                              {truncateText(applicant.profile.bio)}
                            </p>
                          </div>
                        )}
                        {applicant?.profile?.skills && applicant.profile.skills.length > 0 && (
                          <div className="mb-3">
                            <p className="text-muted small mb-2">
                              <strong>Skills:</strong>
                            </p>
                            <div className="d-flex flex-wrap gap-1">
                              {applicant.profile.skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} bg="light" text="dark" className="small">
                                  {skill}
                                </Badge>
                              ))}
                              {applicant.profile.skills.length > 3 && (
                                <Badge bg="secondary" className="small">
                                  +{applicant.profile.skills.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="mb-2">
                          <strong>Status:</strong> {status}
                        </div>
                        <div className="mb-2">
                          <strong>Applied At:</strong> {formatDate(appliedAt)}
                        </div>
                        <div className="mt-auto d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="w-100"
                            onClick={() => {}}
                          >
                            <FaEye className="me-1" />
                            View Profile
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="w-100 d-flex align-items-center justify-content-center"
                            style={{
                              background: 'linear-gradient(135deg, #28a745, #20c997)',
                              border: 'none',
                              color: 'white',
                              borderRadius: '8px',
                              fontWeight: '500',
                              boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.3)';
                            }}
                            onClick={() => handleChat(applicant, job)}
                          >
                            <FaComments className="me-1" />
                            Chat with Applicant
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        ))
      )}
      {showChat && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <ChatModel
            userId={chatJob?.recruiter?._id || chatJob?.recruiter || 'recruiter'}
            otherUser={chatApplicant}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
    </Container>
  );
}

export default Applicants;
