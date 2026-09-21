import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../services/api';
import LifecycleStepper from '../components/LifecycleStepper';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const ReportDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchReport();
    fetchComments();
  }, [id]);

  const fetchReport = async () => {
    try {
      const res = await api.getReportById(id);
      setReport(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.getComments(id);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpvote = async () => {
    try {
      await api.upvoteReport(id);
      fetchReport();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirm = async () => {
    try {
      await api.confirmResolution(id);
      // Optional: Show rating modal
      fetchReport();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    try {
      await api.rejectResolution(id, { reason: rejectReason });
      setRejectReason('');
      fetchReport();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      await api.addComment(id, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  if (!report) return <div>Loading...</div>;

  const isOwner = user && user.id === report.citizen.id;

  return (
    <div className="container mt-4">
      <LifecycleStepper status={report.status} />

      <div className="row mt-4">
        <div className="col-md-8">
          <div className="card p-4 mb-4">
            <h3>{report.category?.icon} {report.title}</h3>
            <p className="text-muted">Reported on {new Date(report.createdAt).toLocaleString()} by {report.citizen.name}</p>
            <p><strong>Address:</strong> {report.address}</p>
            <p><strong>Severity:</strong> {report.severity}</p>
            <p><strong>Description:</strong> {report.description}</p>
            <div className="d-flex align-items-center">
              <StatusBadge status={report.status} />
              <span className="ms-3 badge bg-dark">Priority Score: {report.priorityScore}</span>
            </div>
            
            <div className="mt-4">
              <button className="btn btn-outline-primary" onClick={handleUpvote}>
                👍 Upvote ({report.upvoteCount})
              </button>
            </div>
          </div>

          <div className="card p-4 mb-4">
            <h4>Photos</h4>
            <div className="d-flex flex-wrap gap-2">
              {report.photos && report.photos.map(p => (
                <img key={p.id} src={p.url} alt="Report" className="img-thumbnail" style={{ maxWidth: '200px' }} />
              ))}
              {report.photos && report.photos.length === 0 && <p>No photos uploaded.</p>}
            </div>
          </div>

          {report.status === 'RESOLVED' && report.resolutionProofUrl && (
             <div className="card p-4 mb-4">
                <h4>Resolution Proof</h4>
                <img src={report.resolutionProofUrl} alt="Proof" className="img-thumbnail" style={{ maxWidth: '300px' }} />
                <p className="mt-2">{report.resolutionRemarks}</p>
             </div>
          )}

          <div className="card p-4">
            <h4>Comments</h4>
            <div className="mb-4">
              {comments.map(c => (
                <div key={c.id} className="border-bottom py-2">
                  <strong>{c.user.name}</strong> <small className="text-muted">{new Date(c.createdAt).toLocaleString()}</small>
                  <p className="mb-0">{c.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddComment}>
              <div className="input-group">
                <input type="text" className="form-control" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." required />
                <button type="submit" className="btn btn-primary">Post</button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-md-4">
          {isOwner && report.status === 'CITIZEN_VERIFICATION' && (
            <div className="card p-4 mb-4 border-warning">
              <h5 className="text-warning">Action Required</h5>
              <p>Worker has marked this issue as resolved. Please verify.</p>
              <button className="btn btn-success mb-3" onClick={handleConfirm}>✅ Confirm Resolution</button>
              <div>
                <input type="text" className="form-control mb-2" placeholder="Reason for rejection" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                <button className="btn btn-danger w-100" onClick={handleReject}>❌ Reject Resolution</button>
              </div>
            </div>
          )}

          <div className="card p-4">
            <h5>Status History</h5>
            <ul className="list-unstyled">
              {report.statusHistory && report.statusHistory.map((h, i) => (
                <li key={i} className="mb-2">
                  <StatusBadge status={h.status} />
                  <br />
                  <small className="text-muted">{new Date(h.changedAt).toLocaleString()}</small>
                  {h.remarks && <p className="mb-0 small">{h.remarks}</p>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
