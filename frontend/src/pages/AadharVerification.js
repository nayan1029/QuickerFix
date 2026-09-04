import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AadharVerification() {
  const navigate = useNavigate();
  const [step, setStep] = useState('aadhar'); // 'aadhar', 'otp', 'success'
  const [aadharNumber, setAadharNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [aadharVerified, setAadharVerified] = useState(null);

  // Step 1: Submit Aadhar Number
  const handleAadharSubmit = async (e) => {
    e.preventDefault();
    if (!aadharNumber || aadharNumber.length !== 12) {
      toast.error('Please enter a valid 12-digit Aadhar number');
      return;
    }

    setLoading(true);
    try {
      // Mock API call - replace with actual API endpoint
      toast.success('OTP sent to your registered mobile number');
      setStep('otp');
    } catch (error) {
      toast.error('Error sending OTP: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
                      </label>
                      <p className="text-muted small mb-3">
                        We've sent an OTP to your registered mobile number
                      </p>
                      <input
                        type="text"
                        className="form-control form-control-lg text-center"
                        id="otp"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength="6"
                        disabled={loading}
                        style={{ letterSpacing: '8px', fontSize: '24px', fontWeight: 'bold' }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success btn-lg w-100 fw-bold"
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Verifying...
                        </>
                      ) : (
                        '✓ Verify OTP'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleBack}
                      className="btn btn-outline-secondary btn-sm w-100 mt-3"
                    >
                      ← Back
                    </button>
                  </form>
                )}

                {step === 'success' && (
                  <div className="alert alert-success text-center">
                    <h5>✓ Verification Successful!</h5>
                    <p>Redirecting to registration...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
                            />
                          )}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <small className="text-muted">
                        OTP expires in <strong>5 minutes</strong>
                      </small>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success btn-lg w-100 fw-bold mb-2"
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Verifying...
                        </>
                      ) : (
                        'Verify OTP'
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg w-100"
                      onClick={handleBack}
                      disabled={loading}
                    >
                      Back
                    </button>
                  </form>
                )}

                {step === 'success' && (
                  <div className="text-center">
                    <div className="mb-4">
                      <i
                        className="bi bi-check-circle text-success"
                        style={{ fontSize: '64px' }}
                      ></i>
                    </div>
                    <h3 className="text-success mb-3">Verification Successful!</h3>
                    <p className="text-muted mb-4">
                      Your Aadhar identity has been verified. Redirecting to complete registration...
                    </p>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-4 border-top">
                  <p className="text-center text-muted small">
                    <i className="bi bi-shield"></i> Your data is protected with AES-256 encryption
                  </p>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="card mt-4 border-0 bg-light">
              <div className="card-body">
                <h6 className="card-title mb-3">
                  <i className="bi bi-info-circle text-info"></i> Why Aadhar Verification?
                </h6>
                <ul className="list-unstyled small">
                  <li>✓ Prevents duplicate complaint accounts</li>
                  <li>✓ Ensures accountability and transparency</li>
                  <li>✓ Protects against fraudulent complaints</li>
                  <li>✓ Builds trust in the system</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
