import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Table, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { user_api_key } from './shared/util';

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState({ students: [], recruiters: [], total: 0 });
  const [jobs, setJobs] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: '', id: '', name: '' });
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          const response = await axios.get(`${user_api_key}/admin/verify`, {
            headers: {
              'Authorization': token
            },
            withCredentials: true
          });
          
          if (response.data.success) {
            setIsLoggedIn(true);
            await fetchDashboardStats();
          } else {
            localStorage.removeItem('adminToken');
          }
        } catch (error) {
          localStorage.removeItem('adminToken');
        }
      }
      setCheckingAuth(false);
    };

    checkAdminAuth();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${user_api_key}/admin/dashboard-stats`, {
        headers: { 'Authorization': token }
      });
      if (response.data.success) {
        setDashboardStats(response.data.statistics);
      }
    } catch (error) {
    }
  };

  const fetchUsers = async () => {
    setLoadingData(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${user_api_key}/admin/users`, {
        headers: { 'Authorization': token }
      });
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchJobs = async () => {
    setLoadingData(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${user_api_key}/admin/jobs`, {
        headers: { 'Authorization': token }
      });
      if (response.data.success) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(`${user_api_key}/admin/login`, {
        email: loginData.email,
        password: loginData.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (response.data.success) {
        toast.success("Admin login successful!");
        localStorage.setItem('adminToken', `Bearer ${response.data.token}`);
        setIsLoggedIn(true);
        await fetchDashboardStats();
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Invalid admin credentials or server error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setLoginData({ email: '', password: '' });
    setActiveTab('dashboard');
    setDashboardStats(null);
    setUsers({ students: [], recruiters: [], total: 0 });
    setJobs([]);
    toast.success("Logged out successfully");
  };

  const handleDeleteConfirm = (type, id, name) => {
    setDeleteTarget({ type, id, name });
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = deleteTarget.type === 'user' 
        ? `/admin/users/${deleteTarget.id}`
        : `/admin/jobs/${deleteTarget.id}`;

      const response = await axios.delete(`${user_api_key}${endpoint}`, {
        headers: { 'Authorization': token }
      });

      if (response.data.success) {
        toast.success(`${deleteTarget.type === 'user' ? 'User' : 'Job'} deleted successfully`);
        
        if (deleteTarget.type === 'user') {
          await fetchUsers();
        } else {
          await fetchJobs();
        }
        await fetchDashboardStats();
      }
    } catch (error) {
      toast.error(`Failed to delete ${deleteTarget.type}`);
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget({ type: '', id: '', name: '' });
    }
  };

  const AdminDashboard = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Admin Dashboard</h2>
        <Button variant="outline-danger" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2"></i>
          Logout
        </Button>
      </div>

      <div className="mb-4">
        <Button 
          variant={activeTab === 'dashboard' ? 'primary' : 'outline-primary'} 
          className="me-2 mb-2"
          onClick={() => setActiveTab('dashboard')}
        >
          <i className="bi bi-speedometer2 me-1"></i>
          Dashboard
        </Button>
        <Button 
          variant={activeTab === 'users' ? 'primary' : 'outline-primary'} 
          className="me-2 mb-2"
          onClick={() => {
            setActiveTab('users');
            fetchUsers();
          }}
        >
          <i className="bi bi-people me-1"></i>
          Users
        </Button>
        <Button 
          variant={activeTab === 'jobs' ? 'primary' : 'outline-primary'} 
          className="me-2 mb-2"
          onClick={() => {
            setActiveTab('jobs');
            fetchJobs();
          }}
        >
          <i className="bi bi-briefcase me-1"></i>
          Jobs
        </Button>
      </div>

      {/* Dashboard Content */}
      {activeTab === 'dashboard' && <DashboardOverview />}
      {activeTab === 'users' && <UsersManagement />}
      {activeTab === 'jobs' && <JobsManagement />}
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />
    </div>
  );

  // Dashboard Overview Component
  const DashboardOverview = () => (
    <div>
      {dashboardStats ? (
        <Row>
          <Col md={3} className="mb-4">
            <Card className="bg-primary text-white h-100">
              <Card.Body className="text-center">
                <i className="bi bi-people-fill" style={{fontSize: '3rem'}}></i>
                <h3 className="mt-2">{dashboardStats.users.total}</h3>
                <p>Total Users</p>
                <small>+{dashboardStats.users.recentGrowth} this month</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="bg-success text-white h-100">
              <Card.Body className="text-center">
                <i className="bi bi-person-badge-fill" style={{fontSize: '3rem'}}></i>
                <h3 className="mt-2">{dashboardStats.users.students}</h3>
                <p>Students</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="bg-info text-white h-100">
              <Card.Body className="text-center">
                <i className="bi bi-building" style={{fontSize: '3rem'}}></i>
                <h3 className="mt-2">{dashboardStats.users.recruiters}</h3>
                <p>Recruiters</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="bg-warning text-white h-100">
              <Card.Body className="text-center">
                <i className="bi bi-briefcase-fill" style={{fontSize: '3rem'}}></i>
                <h3 className="mt-2">{dashboardStats.jobs.total}</h3>
                <p>Total Jobs</p>
                <small>+{dashboardStats.jobs.recentGrowth} this month</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading dashboard...</p>
        </div>
      )}

      {dashboardStats && (
        <Row className="mt-4">
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5><i className="bi bi-clock-history me-2"></i>Recent Users</h5>
              </Card.Header>
              <Card.Body>
                {dashboardStats.recentActivity.users.map((user, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center border-bottom py-2">
                    <div>
                      <strong>{user.fullName}</strong>
                      <br />
                      <small className="text-muted">{user.email}</small>
                    </div>
                    <Badge bg={user.role === 'student' ? 'success' : 'info'}>
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5><i className="bi bi-briefcase me-2"></i>Recent Jobs</h5>
              </Card.Header>
              <Card.Body>
                {dashboardStats.recentActivity.jobs.map((job, index) => (
                  <div key={index} className="border-bottom py-2">
                    <strong>{job.title}</strong>
                    <br />
                    <small className="text-muted">
                      {job.company} • Posted by {job.recruiter?.fullName}
                    </small>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );

  // Users Management Component
  const UsersManagement = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4><i className="bi bi-people me-2"></i>Users Management</h4>
        <div>
          <Badge bg="primary" className="me-2">Total: {users.total}</Badge>
          <Badge bg="success" className="me-2">Students: {users.students.length}</Badge>
          <Badge bg="info">Recruiters: {users.recruiters.length}</Badge>
        </div>
      </div>

      {loadingData ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row>
          <Col md={6}>
            <Card>
              <Card.Header className="bg-success text-white">
                <h6 className="mb-0"><i className="bi bi-person-badge me-2"></i>Students ({users.students.length})</h6>
              </Card.Header>
              <Card.Body className="p-0">
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.students.slice(0, 10).map((user) => (
                      <tr key={user._id}>
                        <td>{user.fullName}</td>
                        <td><small>{user.email}</small></td>
                        <td>
                          <Button 
                            size="sm" 
                            variant="outline-danger"
                            onClick={() => handleDeleteConfirm('user', user._id, user.fullName)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header className="bg-info text-white">
                <h6 className="mb-0"><i className="bi bi-building me-2"></i>Recruiters ({users.recruiters.length})</h6>
              </Card.Header>
              <Card.Body className="p-0">
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.recruiters.map((user) => (
                      <tr key={user._id}>
                        <td>{user.fullName}</td>
                        <td><small>{user.email}</small></td>
                        <td>
                          <Button 
                            size="sm" 
                            variant="outline-danger"
                            onClick={() => handleDeleteConfirm('user', user._id, user.fullName)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );

  // Jobs Management Component
  const JobsManagement = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4><i className="bi bi-briefcase me-2"></i>Jobs Management</h4>
        <Badge bg="warning">Total Jobs: {jobs.length}</Badge>
      </div>

      {loadingData ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Card>
          <Card.Body className="p-0">
            <Table striped hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Posted By</th>
                  <th>Posted On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td><strong>{job.title}</strong></td>
                    <td>{job.company}</td>
                    <td>{job.location}</td>
                    <td>
                      <Badge bg={job.type === 'Full-Time' ? 'primary' : 'secondary'}>
                        {job.type}
                      </Badge>
                    </td>
                    <td>{job.recruiter?.fullName || 'Unknown'}</td>
                    <td><small>{new Date(job.createdAt).toLocaleDateString()}</small></td>
                    <td>
                      <Button 
                        size="sm" 
                        variant="outline-danger"
                        onClick={() => handleDeleteConfirm('job', job._id, job.title)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="warning">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Are you sure you want to delete this {deleteTarget.type}?
        </Alert>
        <p><strong>Name:</strong> {deleteTarget.name}</p>
        <p className="text-danger">
          <small> This action cannot be undone. {deleteTarget.type === 'user' && 'If this is a recruiter, all their jobs will also be deleted.'}</small>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={executeDelete}>
          <i className="bi bi-trash me-1"></i>
          Delete {deleteTarget.type === 'user' ? 'User' : 'Job'}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Admin Login Form
  const AdminLoginForm = () => (
    <Row className="justify-content-center align-items-center min-vh-100">
      <Col md={6} lg={4}>
        <Card className="shadow-lg">
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <i className="bi bi-shield-lock-fill text-primary" style={{fontSize: '4rem'}}></i>
              <h2 className="mt-3 text-primary">Admin Portal</h2>
              <p className="text-muted">Please login to access the admin dashboard</p>
            </div>
            
            <Form onSubmit={handleAdminLogin}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleInputChange}
                  placeholder="Enter admin email"
                  required
                  disabled={loading}
                />
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    placeholder="Enter admin password"
                    required
                    disabled={loading}
                  />
                  <Button
                    variant="link"
                    className="position-absolute end-0 top-0 border-0 text-muted"
                    style={{ zIndex: 10 }}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </Button>
                </div>
              </Form.Group>
              
              <Button
                variant="primary"
                type="submit"
                className="w-100 py-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login as Admin
                  </>
                )}
              </Button>
            </Form>
            
            <div className="text-center mt-4">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Admin access only. Contact system administrator for credentials.
              </small>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  return (
    <Container fluid className="admin-container">
      {checkingAuth ? (
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={4} className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Checking authentication...</p>
          </Col>
        </Row>
      ) : isLoggedIn ? (
        <AdminDashboard />
      ) : (
        <AdminLoginForm />
      )}
    </Container>
  );
}

export default Admin;
