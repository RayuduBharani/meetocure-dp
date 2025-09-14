import React, { useEffect, useState } from "react";
import { ArrowLeft, User, Calendar, MapPin, Phone, GraduationCap, Building, CreditCard, FileText, Award, Shield, Clock, Stethoscope } from "lucide-react";
import { API_BASE_URL } from "../../../lib/config";
import { useNavigate } from "react-router-dom";

const ProfileView = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("doctorToken");
        
        if (!token) {
          setError("Not authenticated. Please login again.");
          window.location.href = "/doctor/login";
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/doctor/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("doctorToken");
          localStorage.removeItem("doctorInfo");
          setError("Session expired. Please login again.");
          window.location.href = "/doctor/login";
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await response.json();
        if (data.message) {
          throw new Error(data.message);
        }

        setDoctorData(data);
        setIsLoading(false);
      } catch (e) {
        setError(e.message || "Failed to load profile");
        setIsLoading(false);
        console.error("Profile fetch error:", e);
      }
    };

    fetchProfile();
  }, []);

  const navigate = useNavigate();
  
  const handleBackClick = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!doctorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No profile data available</p>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line no-unused-vars
  const InfoCard = ({ title, children, icon: Icon }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-[#0A4D68] rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-[#0A4D68]">{title}</h3>
      </div>
      {children}
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
      <span className="text-gray-600 text-sm font-medium">{label}</span>
      <span className="text-gray-800 font-semibold text-sm">{value || "N/A"}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-inter flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10 w-full">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackClick}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Doctor Profile</h1>
                  <p className="text-sm text-gray-600">Comprehensive medical profile</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-100 to-yellow-100 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  {doctorData.profileImage ? (
                    <img
                      src={doctorData.profileImage}
                      alt="Doctor"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
              </div>
              {doctorData.verified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                {doctorData.fullName}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <p className="text-blue-600 font-semibold">
                  {doctorData.primarySpecialization}
                </p>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
                <span className={`px-4 py-2 text-sm rounded-full font-medium ${
                  doctorData.verified
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-amber-100 text-amber-700 border border-amber-200"
                }`}>
                  {doctorData.verified ? "✓ Verified Doctor" : "⏳ Pending Verification"}
                </span>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {doctorData.experienceYears}+ years
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Overview */}
          <InfoCard title="Overview" icon={Award}>
            <div className="space-y-3">
              <InfoRow label="Category" value={doctorData.category} />
              <InfoRow label="Experience" value={`${doctorData.experienceYears} years`} />
              <InfoRow label="Specializations" value={doctorData.additionalSpecializations} />
              <InfoRow label="Consultation Fee" value={`₹${doctorData.consultationFee || 'Not set'}`} />
              {doctorData.about && (
                <div className="pt-2">
                  <label className="text-gray-600 text-sm font-medium mb-2 block">About</label>
                  <p className="text-gray-800 text-sm whitespace-pre-wrap rounded-lg bg-gray-50 p-3">
                    {doctorData.about}
                  </p>
                </div>
              )}
            </div>
          </InfoCard>

          {/* Personal Information */}
          <InfoCard title="Personal Information" icon={User}>
            <div className="space-y-3">
              <InfoRow label="Gender" value={doctorData.gender} />
              <InfoRow label="Date of Birth" value={doctorData.dateOfBirth} />
              <InfoRow label="Medical Council Reg. No" value={doctorData.medicalCouncilRegistrationNumber} />
              <InfoRow label="Medical Council" value={doctorData.medicalCouncilName} />
              <InfoRow label="Year of Registration" value={doctorData.yearOfRegistration} />
              <InfoRow label="Aadhaar" value={doctorData.aadhaarNumber} />
              <InfoRow label="PAN" value={doctorData.panNumber} />
            </div>
          </InfoCard>
        </div>

        {/* Education & Qualifications */}
        <InfoCard title="Education & Qualifications" icon={GraduationCap}>
          {doctorData.qualifications?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctorData.qualifications.map((q, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm mb-1">{q.degree}</h4>
                      <p className="text-gray-600 text-xs mb-2">{q.universityCollege}</p>
                      <span className="text-blue-600 font-semibold text-xs">{q.year}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No qualifications added</p>
          )}
        </InfoCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Hospital Information */}
          <InfoCard title="Hospital Information" icon={Building}>
            {doctorData.hospitalInfo?.length > 0 ? (
              <div className="space-y-4">
                {doctorData.hospitalInfo.map((h, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-gray-100">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-green-600" />
                        <h4 className="font-bold text-gray-800 text-sm">{h.hospitalName}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{h.hospitalAddress}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{h.contactNumber}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hospital information</p>
            )}
          </InfoCard>

          {/* Banking Information */}
          <InfoCard title="Banking Information" icon={CreditCard}>
            {doctorData.bankingInfo?.length > 0 ? (
              <div className="space-y-4">
                {doctorData.bankingInfo.map((b, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-gray-100">
                    <div className="space-y-2">
                      <InfoRow label="Bank Name" value={b.bankName} />
                      <InfoRow label="Branch" value={b.bankBranch} />
                      <InfoRow label="Account Holder" value={b.accountHolderName} />
                      <InfoRow label="Account Number" value={b.accountNumber} />
                      <InfoRow label="IFSC Code" value={b.ifscCode} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No banking details available</p>
            )}
          </InfoCard>
        </div>

        {/* Documents */}
        <div className="mt-8">
          <InfoCard title="Documents" icon={FileText}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center mb-3 hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-300">
                  {doctorData.identityDocument ? (
                    <img
                      src={doctorData.identityDocument}
                      alt="Identity"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <FileText className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-700">Identity Document</p>
              </div>
              
              <div className="text-center">
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center mb-3 hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-300">
                  {doctorData.medicalCouncilCertificate ? (
                    <img
                      src={doctorData.medicalCouncilCertificate}
                      alt="Council Certificate"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Award className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-700">Medical Council Certificate</p>
              </div>
            </div>
          </InfoCard>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;