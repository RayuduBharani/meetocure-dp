import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Shield, CheckCircle, LogOut, XCircle } from 'lucide-react';
import { API_BASE_URL } from '../../lib/config';

export default function DoctorVerificationPending() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('under review by hospital');
  const [serverInfo, setServerInfo] = useState({ doctorId: '', message: '', registrationStatus: '' });

  useEffect(() => {
    let isMounted = true;
    const fromStorage = localStorage.getItem('doctorInfo');
    let parsedInfo = null;
    try {
      parsedInfo = fromStorage ? JSON.parse(fromStorage) : null;
    } catch (err) {
      console.warn('Failed to parse doctorInfo from localStorage:', err);
    }
    const doctorId = localStorage.getItem('doctorId') || parsedInfo?.doctorId || parsedInfo?._id;
    if (!doctorId) {
      console.warn('Doctor ID not found in localStorage. Redirecting to doctor verification.');
      navigate('/dual-doctor');
      return;
    }

    const controller = new AbortController();
    const fetchStatus = async () => {
      try {
        const url = `${API_BASE_URL}/api/doctor/verification-status/${doctorId}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          const text = await res.text();
          console.warn('Verification status fetch failed', { status: res.status, body: text });
          return;
        }
        const data = await res.json();
        if (!isMounted) return;
        const newStatus = data?.registrationStatus || data?.doctor?.registrationStatus || 'under review by hospital';
        console.log('Verification status:', newStatus);
        setStatus(newStatus);
        setServerInfo({
          doctorId: data?.doctorId || data?.doctor?._id || doctorId,
          message: data?.message || '',
          registrationStatus: newStatus,
        });
        if (newStatus === 'verified') {
          clearInterval(intervalId);
          navigate('/doctor-dashboard');
        } else if (newStatus === 'rejected') {
          // Stop polling and stay on this page to show rejected UI
          clearInterval(intervalId);
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Error fetching verification status:', e);
        }
      }
    };

    fetchStatus();
    const intervalId = setInterval(fetchStatus, 5000);
    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(intervalId);
    };
  }, [navigate]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('doctorToken');
      localStorage.removeItem('doctorInfo');
      localStorage.removeItem('doctorId');
      // Do not clear hospital/doctorData to allow resume later
    } catch (e) {
      console.log(e)
    }
    navigate('/choose-role');
  };
  const handleResubmit = () => {
    navigate('/dual-doctor', {
      state: {
        from: 'verification-pending',
        serverInfo,
      },
    });
  };
  const isRejected = status === 'rejected';

  return (
    <div className="min-h-screen bg-white font-[Poppins] px-6 pt-6 pb-28">
      <div className="max-w-md w-full mx-auto bg-white rounded-[2rem] shadow-xl border border-gray-200 p-8">
        {/* Header Icon */}
        <div className="flex flex-col items-center justify-center mb-6">
          <img src="/assets/logo.png" alt="Logo" className="w-16 h-16 mb-3" />
          <div className="relative">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isRejected ? 'bg-red-50' : 'bg-primary/10'}`}>
              {isRejected ? (
                <XCircle className="w-8 h-8 text-red-600" />
              ) : (
                <Shield className="w-8 h-8 text-primary" />
              )}
            </div>
            {!isRejected && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center ring-4 ring-white">
                <Clock className="w-3 h-3 text-amber-800" />
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-[#004B5C] text-center mb-2">
          {isRejected ? 'Verification Rejected' : 'Verification Pending'}
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          {isRejected
            ? 'Your submission was rejected. Please review your information and re-submit your verification.'
            : 'We’re reviewing your details to keep MeetoCure safe and trusted.'}
        </p>

        {/* Main Message */}
        {!isRejected && (
          <div className="text-center mb-6">
            <p className="text-gray-700 text-base leading-relaxed">
              Please wait while your hospital and admin review and accept your verification request.
            </p>
          </div>
        )}

        {/* Status Steps */}
        <div className="space-y-4 mb-6">
          {!isRejected ? (
            <>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-800">Application submitted</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-primary rounded-full flex-shrink-0 animate-pulse">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full m-1.5"></div>
                </div>
                <span className="text-sm text-gray-800">Under hospital review</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-500">Admin approval</span>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">Verification rejected</span>
              </div>
              {/* Show server response details if present */}
              {(serverInfo.message || serverInfo.registrationStatus || serverInfo.doctorId) && (
                <div className="text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg p-3">
                  {serverInfo.message && (
                    <div className="flex justify-between gap-2"><span className="font-semibold">Message:</span><span className="text-right">{serverInfo.message}</span></div>
                  )}
                  {serverInfo.registrationStatus && (
                    <div className="flex justify-between gap-2"><span className="font-semibold">Status:</span><span className="text-right">{serverInfo.registrationStatus}</span></div>
                  )}
                  {serverInfo.doctorId && (
                    <div className="flex justify-between gap-2"><span className="font-semibold">Doctor ID:</span><span className="text-right break-all">{serverInfo.doctorId}</span></div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="text-center text-xs text-gray-500">Current status: {status}</div>
        </div>

        {/* Info Box */}
        <div className={`${isRejected ? 'bg-red-50 border-red-200' : 'bg-primary/5 border-primary/20'} border rounded-xl p-4 mb-6`}>
          <div className="flex items-start space-x-3">
            <div className={`w-5 h-5 ${isRejected ? 'text-red-600' : 'text-primary'} flex-shrink-0 mt-0.5`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              {isRejected ? (
                <>
                  <p className="text-sm text-red-700 font-semibold mb-1">Action required</p>
                  <p className="text-sm text-red-700">Update your details and re-submit your verification to proceed.</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-[#004B5C] font-semibold mb-1">What happens next?</p>
                  <p className="text-sm text-gray-700">You'll receive an email notification once your verification is approved. This process typically takes 1-3 business days.</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-4 grid grid-cols-1 gap-3">
          {isRejected && (
            <button onClick={handleResubmit} className="w-full bg-red-600 text-white font-semibold py-3 px-4 rounded-full hover:bg-red-700 transition-colors duration-200">
              Re-submit Verification
            </button>
          )}
          <button onClick={handleLogout} className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-full hover:bg-primary-hover transition-colors duration-200 flex items-center justify-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Having trouble? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
