
import React, { useEffect, useState } from 'react';
// ...existing code...
import { useSelector } from 'react-redux';
import { user_api_key } from './shared/util';
import ChatModel from './shared/ChatModel';
import axios from 'axios';


function ApplicationPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatRecruiter, setChatRecruiter] = useState(null);
  const [chatJob, setChatJob] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);


  // Fetch student ID from Redux store
  const { user } = useSelector(state => state.auth);
  const studentId = user?.id || user?._id;

  useEffect(() => {
    const fetchApplications = async () => {
      if (!studentId) return;
      try {
        // Get all jobs a student has applied to (single endpoint)
        const res = await axios.get(`${user_api_key}/jobs/applied/${studentId}`, { withCredentials: true });
        const jobs = res.data.jobs || [];
        setApplications(jobs);
      } catch (err) {
        console.error("Failed to fetch applications or jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [studentId]);


  // Cancel application handler (UI only)
  const handleCancel = async (id) => {
    try {
      await axios.delete(`${user_api_key}/apply/${id}`, {
        data: { userId: studentId },
        withCredentials: true
      });
      setApplications(applications => applications.filter(app => app._id !== id));
    } catch (err) {
      alert('Failed to cancel application.');
    }
  };

  // Chat button handler
  const handleChat = async (recruiter, job) => {
    let recruiterObj = recruiter;
    // If recruiter is a string (id), fetch the recruiter object
    if (typeof recruiter === 'string') {
      try {
        const res = await axios.get(`${user_api_key}/recruiter/${recruiter}`);
        recruiterObj = res.data.recruiter;
      } catch (err) {
        alert('Failed to load recruiter details.');
        return;
      }
    }
    console.log('handleChat recruiter:', recruiterObj);
    if (recruiterObj && typeof recruiterObj === 'object') {
      console.log('Recruiter keys:', Object.keys(recruiterObj));
    }
    setChatRecruiter(recruiterObj);
    setChatJob(job);
    setShowChat(true);
    // Chat history will be loaded by ChatModel
  };

  const handleSendMessage = async (msg) => {
    // Message sending is handled by ChatModel via Socket.IO
  };

  if (loading) return <div>Loading your applications...</div>;


  return (
    <div className="application-catalog" style={{ padding: '20px' }}>
      <h2>Jobs You've Applied To</h2>

      {applications.length === 0 ? (
        <p>You haven't applied to any jobs yet.</p>
      ) : (
        <div className="job-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {applications.map(app => (
            <div
              key={app._id}
              className="job-card"
              style={{
                border: '1px solid #ccc',
                padding: '16px',
                borderRadius: '8px',
                width: '300px',
              }}
            >
              <h3>{app.job?.title || 'Job Title'}</h3>
              <p><strong>Company:</strong> {app.job?.company || 'N/A'}</p>
              <p><strong>Location:</strong> {app.job?.location || 'N/A'}</p>
              <p><strong>Status:</strong> {app.status}</p>
              <p><small>Applied on: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}</small></p>
              <button
                style={{ marginTop: '10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer' }}
                onClick={() => handleCancel(app._id)}
              >
                Cancel
              </button>
              {app.job?.recruiter && (
                <button
                  className="btn btn-success d-flex align-items-center"
                  style={{ 
                    marginTop: '10px', 
                    marginLeft: '10px',
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '14px',
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
                  onClick={() => handleChat(app.job.recruiter, app.job)}
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ marginRight: '8px' }}
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Chat with Recruiter
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showChat && chatRecruiter && (
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
            key={chatRecruiter._id || chatRecruiter.id || Math.random()}
            userId={studentId}
            otherUser={chatRecruiter}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
    </div>
  );
}

export default ApplicationPage;
