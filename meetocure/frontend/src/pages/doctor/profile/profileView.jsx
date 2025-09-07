import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import TopIcons from "../../../components/TopIcons";
import profileImg from "/assets/doc_profile.png";
import { API_BASE_URL } from "../../../lib/config";

const ProfileView = () => {
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("doctorToken");
        const response = await fetch(`${API_BASE_URL}/api/doctor/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (response.status === 401) {
          localStorage.removeItem("doctorToken");
          localStorage.removeItem("doctorInfo");
          window.location.href = "/doctor-verify";
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to load profile");
        }
        const data = await response.json();
        if (isMounted) setDoctorData(data);
      } catch (e) {
        if (isMounted) setError(e.message || "Failed to load profile");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-destructive text-sm">
        {error}
      </div>
    );
  }

  if (!doctorData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
        No profile data available
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-[Poppins] px-4 sm:px-6 pt-6 pb-28">
      {/* Top Nav */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaArrowLeft
            className="text-xl text-foreground cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <h1 className="text-xl font-semibold text-foreground">Doctor Profile</h1>
        </div>
        <TopIcons />
      </div>

      {/* Profile Header */}
      <section className="mb-8">
        <div className="mx-auto max-w-4xl">
          <div className="bg-card text-card-foreground border rounded-2xl shadow-sm p-6 flex flex-col items-center">
            <div className="rounded-full p-1 bg-background border">
              <img
                src={doctorData.profileImage || profileImg}
                alt="Doctor"
                className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-full"
              />
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                {doctorData.fullName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {doctorData.primarySpecialization || "Specialization"}
              </p>
              <div className="mt-2">
                <span
                  className={`px-2.5 py-1 text-[10px] sm:text-xs rounded-full border ${
                    doctorData.verified
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {doctorData.verified ? "Verified" : "Pending Verification"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Sections */}
      <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            title: "Overview",
            content: (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium text-foreground">{doctorData.category || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium text-foreground">
                    {doctorData.experienceYears ? `${doctorData.experienceYears} years` : "N/A"}
                  </span>
                </div>
              </div>
            ),
          },
          {
            title: "Personal Information",
            content: (
              <div className="space-y-3 text-sm">
                {[
                  ["Gender", doctorData.gender],
                  ["Date of Birth", doctorData.dateOfBirth],
                  ["Medical Council Reg. No", doctorData.medicalCouncilRegistrationNumber],
                  ["Medical Council Name", doctorData.medicalCouncilName],
                  ["Year of Registration", doctorData.yearOfRegistration],
                  ["Additional Specializations", doctorData.additionalSpecializations],
                  ["Aadhaar", doctorData.aadhaarNumber],
                  ["PAN", doctorData.panNumber],
                ].map(([label, value], idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value || "N/A"}</span>
                  </div>
                ))}
              </div>
            ),
          },
        ].map((section, idx) => (
          <section
            key={idx}
            className="bg-card text-card-foreground rounded-2xl border shadow-sm p-6"
          >
            <h3 className="text-base font-semibold mb-4">{section.title}</h3>
            {section.content}
          </section>
        ))}
      </div>

      {/* Education */}
      <section className="mx-auto max-w-5xl bg-card text-card-foreground rounded-2xl border shadow-sm p-6 mt-6">
        <h3 className="text-base font-semibold mb-4">Education & Qualifications</h3>
        {doctorData.qualifications?.length > 0 ? (
          <div className="space-y-3">
            {doctorData.qualifications.map((q, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {q.degree} - {q.universityCollege}
                </span>
                <span className="font-medium text-foreground">{q.year}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No qualifications added</p>
        )}
      </section>

      {/* Hospital Info */}
      <section className="mx-auto max-w-5xl bg-card text-card-foreground rounded-2xl border shadow-sm p-6 mt-6">
        <h3 className="text-base font-semibold mb-4">Hospital Information</h3>
        {doctorData.hospitalInfo?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {doctorData.hospitalInfo.map((h, idx) => (
              <div key={idx} className="p-4 border rounded-xl text-sm bg-background">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Hospital Name</span>
                  <span className="font-medium text-foreground">{h.hospitalName}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-medium text-foreground">{h.hospitalAddress}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Contact</span>
                  <span className="font-medium text-foreground">{h.contactNumber}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No hospital information</p>
        )}
      </section>

      {/* Banking */}
      <section className="mx-auto max-w-5xl bg-card text-card-foreground rounded-2xl border shadow-sm p-6 mt-6">
        <h3 className="text-base font-semibold mb-4">Banking Information</h3>
        {doctorData.bankingInfo?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {doctorData.bankingInfo.map((b, idx) => (
              <div key={idx} className="p-4 border rounded-xl text-sm bg-background">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bank Name</span>
                  <span className="font-medium text-foreground">{b.bankName}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Branch</span>
                  <span className="font-medium text-foreground">{b.bankBranch}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Account Holder</span>
                  <span className="font-medium text-foreground">{b.accountHolderName}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Account Number</span>
                  <span className="font-medium text-foreground">{b.accountNumber}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">IFSC Code</span>
                  <span className="font-medium text-foreground">{b.ifscCode}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No banking details available</p>
        )}
      </section>

      {/* Documents */}
      <section className="mx-auto max-w-5xl bg-card text-card-foreground rounded-2xl border shadow-sm p-6 mt-6">
        <h3 className="text-base font-semibold mb-4">Documents</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <p className="font-medium text-xs text-muted-foreground">Identity Document</p>
            <img
              src={doctorData.identityDocument || profileImg}
              alt="Identity"
              className="w-full aspect-[4/3] object-cover border rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <p className="font-medium text-xs text-muted-foreground">Medical Council Certificate</p>
            <img
              src={doctorData.medicalCouncilCertificate || profileImg}
              alt="Council Certificate"
              className="w-full aspect-[4/3] object-cover border rounded-lg"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfileView;
