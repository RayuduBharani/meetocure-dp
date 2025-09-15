import React from 'react';
import { Users, Calendar, Clock, Star, Heart, Activity } from 'lucide-react';

const PatientInsights = ({ 
  patientData = {},
  appointmentData = {},
  insights = {}
}) => {
  const {
    totalPatients = 0,
    newPatients = 0,
    ageGroups = {},
    genderDistribution = {},
    topConditions = []
  } = patientData;

  const {
    averageSessionDuration = 0,
    appointmentTypes = {}
  } = appointmentData;

  const {
    patientSatisfaction = 0,
    retentionRate = 0,
    referralRate = 0,
    averageWaitTime = 0
  } = insights;

  return (
    <div className="space-y-6">
      {/* Patient Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total Patients</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">{totalPatients}</h3>
          <p className="text-gray-500 text-sm">All time</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">New Patients</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">{newPatients}</h3>
          <p className="text-gray-500 text-sm">This month</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Retention Rate</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">{retentionRate}%</h3>
          <p className="text-gray-500 text-sm">Returning patients</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <Activity className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">Satisfaction</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">{patientSatisfaction}%</h3>
          <p className="text-gray-500 text-sm">Average rating</p>
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Age Distribution</h3>
          <div className="space-y-3">
            {Object.entries(ageGroups).map(([age, count]) => (
              <div key={age} className="flex items-center justify-between">
                <span className="text-gray-600">{age} years</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${totalPatients > 0 ? (count / totalPatients) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-800 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Gender Distribution</h3>
          <div className="space-y-3">
            {Object.entries(genderDistribution).map(([gender, count]) => (
              <div key={gender} className="flex items-center justify-between">
                <span className="text-gray-600 capitalize">{gender}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}
                      style={{ 
                        width: `${totalPatients > 0 ? (count / totalPatients) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-800 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Types</h3>
          <div className="space-y-3">
            {Object.entries(appointmentTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    type === 'virtual' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {type === 'virtual' ? (
                      <Activity className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Users className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <span className="text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                </div>
                <span className="text-lg font-bold text-gray-800">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Avg. Session Duration</span>
              <span className="text-lg font-bold text-gray-800">{averageSessionDuration} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Avg. Wait Time</span>
              <span className="text-lg font-bold text-gray-800">{averageWaitTime} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Referral Rate</span>
              <span className="text-lg font-bold text-gray-800">{referralRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Conditions */}
      {topConditions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Most Common Conditions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topConditions.map((condition, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{condition.name}</span>
                <span className="text-sm font-bold text-gray-800">{condition.count} cases</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientInsights;
