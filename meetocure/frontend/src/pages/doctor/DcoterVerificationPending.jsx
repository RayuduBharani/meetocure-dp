import React from 'react';
import { Clock, Shield, CheckCircle, LogOut } from 'lucide-react';

export default function DoctorVerificationPending() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Clock className="w-3 h-3 text-yellow-800" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
          Verification Pending
        </h1>

        {/* Main Message */}
        <div className="text-center mb-6">
          <p className="text-gray-600 text-base leading-relaxed">
            Please wait while your hospital and admin review and accept your verification request.
          </p>
        </div>

        {/* Status Steps */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">Application submitted</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-blue-500 rounded-full flex-shrink-0 animate-pulse">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full m-1.5"></div>
            </div>
            <span className="text-sm text-gray-700">Under hospital review</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
            <span className="text-sm text-gray-400">Admin approval</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">What happens next?</p>
              <p className="text-sm text-blue-700">
                You'll receive an email notification once your verification is approved. This process typically takes 1-3 business days.
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mb-4">
          <button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2">
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
