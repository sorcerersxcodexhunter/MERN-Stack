import { useState } from 'react';
import { Button, Modal, Form, Spinner } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { user_api_key } from './util';
import { setJob } from '../../redux/feature/AuthSlice.jsx';

function ModelJobs({ show, onHide, onJobPosted }) {
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    type: 'Full-Time',
    technology: '',
    details: ''
  });
  
  const dispatch = useDispatch();
  
  const handleClose = () => {
    onHide();
    setJobData({
      title: '',
      company: '',
      location: '',
      salary: '',
      type: 'Full-Time',
      technology: '',
      details: ''
    });
  };

  const handleChange = (e) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!jobData.title || !jobData.company || !jobData.location || !jobData.salary || !jobData.type || !jobData.technology) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${user_api_key}/jobs/postjob`, jobData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      
      if (response.data.status === 'success') {
        toast.success("Job posted successfully!");
        dispatch(setJob(response.data.job));
        if (onJobPosted) onJobPosted(response.data.job);
        handleClose();
      } else {
        toast.error(response.data.message || "Failed to post job");
      }
      
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while posting the job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Post a New Job</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formTitle">
            <Form.Label>Job Title <span className="text-danger">*</span></Form.Label>
            <Form.Control 
              type="text" 
              name="title" 
              value={jobData.title} 
              onChange={handleChange} 
              placeholder="e.g. Senior React Developer"
              required 
            />
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="formCompany">
            <Form.Label>Company <span className="text-danger">*</span></Form.Label>
            <Form.Control 
              type="text" 
              name="company" 
              value={jobData.company} 
              onChange={handleChange} 
              placeholder="e.g. Tech Corp"
              required 
            />
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="formLocation">
            <Form.Label>Location <span className="text-danger">*</span></Form.Label>
            <Form.Control 
              type="text" 
              name="location" 
              value={jobData.location} 
              onChange={handleChange} 
              placeholder="e.g. New York, NY or Remote"
              required 
            />
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="formSalary">
            <Form.Label>Salary <span className="text-danger">*</span></Form.Label>
            <Form.Control 
              type="text" 
              name="salary" 
              value={jobData.salary} 
              onChange={handleChange} 
              placeholder="e.g. $60,000 - $80,000"
              required 
            />
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="formType">
            <Form.Label>Job Type <span className="text-danger">*</span></Form.Label>
            <Form.Select 
              name="type" 
              value={jobData.type} 
              onChange={handleChange}
              required
            >
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
              <option value="Temporary">Temporary</option>
              <option value="Freelance">Freelance</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Remote">Remote</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="formTechnology">
            <Form.Label>Technology/Skills <span className="text-danger">*</span></Form.Label>
            <Form.Control 
              type="text" 
              name="technology" 
              value={jobData.technology} 
              onChange={handleChange} 
              placeholder="e.g. React, Node.js, JavaScript (comma separated)"
              required 
            />
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="formDetails">
            <Form.Label>Job Details</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={4} 
              name="details" 
              value={jobData.details} 
              onChange={handleChange} 
              placeholder="Describe the job role, responsibilities, requirements, and benefits..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="success" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Posting...
            </>
          ) : (
            'Post Job'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModelJobs;