import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { identityService } from '../services/identityService';

export default function AadharVerification() {
  const navigate = useNavigate();
  const [step, setStep] = useState('aadhar');
  const [aadharNumber, setAadharNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const messageFor = (error, fallback) => error?.message || error?.data?.message || fallback;

  const requestOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{12}$/.test(aadharNumber)) return toast.error('Enter a valid 12-digit Aadhaar number.');
    setLoading(true);
    try {
      const response = await identityService.requestOtp(aadharNumber);
      toast.success(response?.message || 'OTP sent to your registered mobile number.');
      setStep('otp');
    } catch (error) {
      toast.error(messageFor(error, 'Unable to send OTP.'));
    } finally { setLoading(false); }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) return toast.error('Enter the 6-digit OTP.');
    setLoading(true);
    try {
      const response = await identityService.verifyOtp(aadharNumber, otp);
      toast.success(response?.message || 'Aadhaar verification completed.');
      setStep('success');
      window.setTimeout(() => navigate('/register', { state: { aadharVerified: true } }), 1200);
    } catch (error) {
      toast.error(messageFor(error, 'OTP verification failed.'));
    } finally { setLoading(false); }
  };

  return <div className="container py-5" style={{ maxWidth: 560 }}><div className="card shadow-sm"><div className="card-body p-4">
    <h2 className="h4 text-center">Aadhaar verification</h2><p className="text-muted text-center mb-4">Verify your identity before creating a citizen account.</p>
    {step === 'aadhar' && <form onSubmit={requestOtp}><label className="form-label" htmlFor="aadharNumber">Aadhaar number</label><input id="aadharNumber" className="form-control form-control-lg" inputMode="numeric" maxLength="12" value={aadharNumber} onChange={(event) => setAadharNumber(event.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="12-digit number" disabled={loading} required /><button className="btn btn-primary w-100 mt-4" disabled={loading}>{loading ? 'Sending OTP…' : 'Send OTP'}</button></form>}
    {step === 'otp' && <form onSubmit={verifyOtp}><label className="form-label" htmlFor="otp">One-time password</label><input id="otp" className="form-control form-control-lg text-center" inputMode="numeric" maxLength="6" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" disabled={loading} required /><p className="text-muted small mt-2">The OTP expires after five minutes.</p><button className="btn btn-success w-100 mt-3" disabled={loading}>{loading ? 'Verifying…' : 'Verify OTP'}</button><button className="btn btn-outline-secondary w-100 mt-2" disabled={loading} type="button" onClick={() => { setOtp(''); setStep('aadhar'); }}>Back</button></form>}
    {step === 'success' && <div className="alert alert-success text-center mb-0">Verification successful. Continuing to registration…</div>}
  </div></div></div>;
}
