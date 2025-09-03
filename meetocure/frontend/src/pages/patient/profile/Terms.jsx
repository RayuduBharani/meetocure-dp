import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaFileContract,
  FaShieldAlt,
  FaUserShield,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import TopIcons from "../../../components/PatientTopIcons";

const Terms = () => {
  const navigate = useNavigate();

  const termsSections = [
    {
      title: "Acceptance of Terms",
      icon: <FaCheckCircle className="text-green-500" />,
      content: `By accessing and using the Meetocure application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      title: "Description of Service",
      icon: <FaFileContract className="text-blue-500" />,
      content: `Meetocure provides a platform for patients to connect with healthcare providers, schedule appointments, access medical information, and receive healthcare services. Our service includes but is not limited to appointment booking, doctor consultations, health records management, and health tips.`
    },
    {
      title: "User Responsibilities",
      icon: <FaUserShield className="text-purple-500" />,
      content: `You are responsible for maintaining the confidentiality of your account information, providing accurate and complete information, and using the service in compliance with applicable laws. You must not misuse the service or attempt to gain unauthorized access.`
    },
    {
      title: "Privacy & Data Protection",
      icon: <FaShieldAlt className="text-green-500" />,
      content: `We are committed to protecting your privacy and personal health information. Your data is collected, stored, and processed in accordance with our Privacy Policy and applicable data protection laws. We implement appropriate security measures to safeguard your information.`
    },
    {
      title: "Medical Disclaimer",
      icon: <FaExclamationTriangle className="text-orange-500" />,
      content: `The information provided through Meetocure is for general informational purposes only and should not be considered as medical advice. Always consult with qualified healthcare professionals for medical diagnosis and treatment. We are not liable for any medical decisions made based on information from our platform.`
    },
    {
      title: "Limitation of Liability",
      icon: <FaTimesCircle className="text-red-500" />,
      content: `Meetocure shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. Our total liability shall not exceed the amount paid by you for the service in the twelve months preceding the claim.`
    },
    {
      title: "Service Availability",
      icon: <FaCheckCircle className="text-blue-500" />,
      content: `We strive to maintain high service availability but do not guarantee uninterrupted access. The service may be temporarily unavailable due to maintenance, updates, or technical issues. We are not responsible for any inconvenience caused by service interruptions.`
    },
    {
      title: "Termination",
      icon: <FaTimesCircle className="text-gray-500" />,
      content: `Either party may terminate this agreement at any time. Upon termination, your right to use the service will cease immediately. We may terminate or suspend your account if you violate these terms or engage in fraudulent or illegal activities.`
    },
    {
      title: "Changes to Terms",
      icon: <FaFileContract className="text-yellow-500" />,
      content: `We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service after changes constitutes acceptance of the new terms. We will notify you of significant changes via email or in-app notifications.`
    },
    {
      title: "Governing Law",
      icon: <FaShieldAlt className="text-indigo-500" />,
      content: `These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms or your use of the service shall be subject to the exclusive jurisdiction of the courts in Vijayawada, Andhra Pradesh.`
    }
  ];

  // Removed unused handleAcceptTerms function and undefined setAcceptedTerms to fix lint errors.

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#E9F1F8] font-[Poppins] pb-24 md:pb-10">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-6 bg-white shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <FaArrowLeft
            onClick={() => navigate("/patient/profile")}
            className="text-[#0A4D68] text-xl cursor-pointer hover:text-[#08374f]"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A4D68]">Terms & Conditions</h1>
        </div>
        <TopIcons />
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#0A4D68] mb-4">Welcome to Meetocure</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms and Conditions govern your use of the Meetocure application and services. 
              Please read them carefully before using our platform. By using Meetocure, you agree to 
              be bound by these terms and our Privacy Policy.
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        {termsSections.map((section, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 mb-6"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {section.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#0A4D68] mb-3">
                  {section.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-[#0A4D68] mb-3">Contact Us</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about these Terms and Conditions, please contact us:
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Email:</strong> support@meetocure.com</p>
              <p><strong>Phone:</strong> +91 98765 43210</p>
            </div>
            <div>
              <p><strong>Address:</strong> Meetocure Healthcare Pvt. Ltd.</p>
              <p>Vijayawada, Andhra Pradesh, India</p>
            </div>
          </div>
        </div>

        {/* Acceptance Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        </div>

        {/* Back Button */}
        <div className="flex justify-center mt-8 mb-8">
          <button
            onClick={() => navigate("/patient/profile")}
            className="px-6 py-3 border border-[#0A4D68] text-[#0A4D68] rounded-xl hover:bg-[#0A4D68] hover:text-white transition-colors font-medium"
          >
            Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Terms;