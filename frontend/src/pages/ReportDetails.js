import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await api.getReportById(id);
      setReport(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'This report could not be loaded.');
    } finally { setLoading(false); }
  }, [id]);

  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const response = await api.getComments(id);
      setComments(response.data || []);
    } catch {
      setActionError('Comments could not be loaded. You can retry below.');
    } finally { setCommentsLoading(false); }
  }, [id]);

  useEffect(() => { fetchReport(); fetchComments(); }, [fetchReport, fetchComments]);

  const runAction = async (action, message) => {
    setSaving(true); setActionError(''); setFeedback('');
    try {
      await action();
      setFeedback(message);
      await fetchReport();
      return true;
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'That action could not be completed. Please try again.');
      return false;
    } finally { setSaving(false); }
  };

  const submitComment = async event => {
    event.preventDefault();
    const posted = await runAction(() => api.addComment(id, { content: newComment }), 'Comment posted.');
    if (posted) { setNewComment(''); fetchComments(); }
  };

  if (loading) return <div className="container py-5 text-center" role="status">Loading report…</div>;
  if (error || !report) return <div className="container py-5"><div className="alert alert-danger" role="alert">{error || 'Report not found.'} <button className="btn btn-sm btn-outline-danger ms-2" onClick={fetchReport}>Retry</button></div><Link to="/citizen">Back to workspace</Link></div>;

  const isOwner = user && user.id === report.citizenId;
  const canComment = user && (user.role === 'ADMIN' || isOwner || user.role === 'WORKER');

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start mb-4"><div><Link to={user?.role === 'ADMIN' ? '/admin' : user?.role === 'WORKER' ? '/worker' : '/citizen'} className="small text-decoration-none">← Back to workspace</Link><h1 className="h2 mt-2 mb-1">{report.title}</h1><p className="text-muted mb-0">{report.categoryName} · Reported {new Date(report.createdAt).toLocaleString()}</p></div><StatusBadge status={report.status} /></div>
      {actionError && <div className="alert alert-danger" role="alert">{actionError}</div>}{feedback && <div className="alert alert-success" role="status">{feedback}</div>}
      <LifecycleStepper status={report.status} />
      <div className="row g-4 mt-1">
        <div className="col-lg-8">
          <article className="card p-4 mb-4"><div className="d-flex flex-wrap justify-content-between gap-3"><div><span className="eyebrow text-primary bg-white border">{report.categoryName}</span><h2 className="h4 mt-3">{report.title}</h2></div><span className="badge bg-light text-dark border align-self-start">{report.severity} severity</span></div><p className="mb-3">{report.description}</p><p className="text-muted mb-3">{report.address || 'Location not provided'}</p><div className="d-flex flex-wrap gap-2"><span className="badge bg-dark">Priority {report.priorityScore ?? 0}</span><span className="badge bg-light text-dark border">{report.upvoteCount ?? 0} community upvotes</span><span className="badge bg-light text-dark border">{report.commentCount ?? comments.length} updates</span></div>
            {user?.role === 'CITIZEN' && <button className="btn btn-outline-primary align-self-start mt-3" disabled={saving} onClick={() => runAction(() => api.upvoteReport(id), 'Your support has been recorded.')}>Support this report</button>}
          </article>

          <section className="card p-4 mb-4"><h2 className="h5">Evidence</h2><div className="d-flex flex-wrap gap-3">{report.attachments?.map((file, index) => <figure className="mb-0" key={`${file.url}-${index}`}><a href={api.getMediaUrl(file.url)} target="_blank" rel="noreferrer"><img src={api.getMediaUrl(file.url)} alt={file.resolutionProof ? 'Worker completion evidence' : 'Evidence submitted with the report'} className="img-thumbnail" style={{ maxWidth: 240, maxHeight: 220, objectFit: 'cover' }} /></a><figcaption className="small text-muted mt-1">{file.resolutionProof ? 'Completion evidence' : 'Report evidence'}</figcaption></figure>)}</div>{!report.attachments?.length && <p className="text-muted mb-0">No photos have been added to this report.</p>}</section>

          <section className="card p-4"><div className="d-flex justify-content-between align-items-center mb-3"><h2 className="h5 mb-0">Updates and comments</h2><button className="btn btn-sm btn-outline-secondary" onClick={fetchComments} disabled={commentsLoading}>Refresh</button></div>{commentsLoading ? <p role="status">Loading updates…</p> : comments.length ? comments.map(comment => <article key={comment.id} className="border-bottom py-3"><div className="d-flex justify-content-between gap-2"><strong>{comment.authorName}</strong><time className="small text-muted">{new Date(comment.createdAt).toLocaleString()}</time></div><p className="mb-0 mt-2">{comment.content}</p></article>) : <p className="text-muted">No updates have been posted yet.</p>}
            {canComment ? <form className="mt-3" onSubmit={submitComment}><label className="form-label" htmlFor="report-comment">Add an update</label><div className="input-group"><input id="report-comment" className="form-control" value={newComment} onChange={event => setNewComment(event.target.value)} maxLength="2000" placeholder="Share useful information about this report" required /><button className="btn btn-primary" type="submit" disabled={saving || !newComment.trim()}>{saving ? 'Posting…' : 'Post'}</button></div></form> : <p className="small text-muted mt-3 mb-0">Sign in as the report owner or an assigned service team member to comment. <Link to="/login">Sign in</Link></p>}
          </section>
        </div>

        <aside className="col-lg-4"><section className="card p-4 mb-4"><h2 className="h5">Status timeline</h2>{report.statusHistory?.length ? <ol className="list-unstyled mb-0">{report.statusHistory.map((entry, index) => <li key={`${entry.changedAt}-${index}`} className="border-start border-2 ps-3 pb-4 position-relative"><span className="position-absolute top-0 start-0 translate-middle rounded-circle bg-primary" style={{ width: 10, height: 10 }} /><StatusBadge status={entry.newStatus} /><time className="d-block small text-muted mt-2">{new Date(entry.changedAt).toLocaleString()}</time><span className="small text-muted">By {entry.actorName || 'Service team'}</span>{entry.remark && <p className="small mt-1 mb-0">{entry.remark}</p>}</li>)}</ol> : <p className="text-muted mb-0">No status changes have been recorded yet.</p>}</section>
          {isOwner && report.status === 'CITIZEN_VERIFICATION' && <section className="card p-4 border-warning"><h2 className="h5">Please verify the repair</h2><p>Review the completion evidence. Confirm the repair or reopen the report with a reason.</p><button className="btn btn-success w-100 mb-3" disabled={saving} onClick={() => runAction(() => api.confirmResolution(id), 'Repair confirmed. This report is now closed.')}>Confirm repair</button><label className="form-label" htmlFor="reopen-reason">What still needs attention?</label><textarea id="reopen-reason" className="form-control mb-2" rows="3" maxLength="1000" value={rejectReason} onChange={event => setRejectReason(event.target.value)} required /><button className="btn btn-outline-danger w-100" disabled={saving || !rejectReason.trim()} onClick={() => runAction(() => api.rejectResolution(id, { reason: rejectReason.trim() }), 'The report has been reopened for more work.')}>Reopen report</button></section>}
        </aside>
      </div>
    </div>
  );
};

export default ReportDetails;
