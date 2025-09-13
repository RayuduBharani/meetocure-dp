import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaQuestionCircle,
  FaPhone,
  FaEnvelope,
  FaComments,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaWhatsapp,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import TopIcons from "../../../components/PatientTopIcons";
import { motion } from "framer-motion";

const HelpSupport = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      question: "How do I book an appointment with a doctor?",
      answer: "To book an appointment, go to the dashboard, select a category or search for a doctor, choose your preferred doctor, select an available time slot, and confirm your booking. You'll receive a confirmation via SMS and email."
    },
    {
      question: "Can I cancel or reschedule my appointment?",
      answer: "Yes, you can cancel or reschedule appointments up to 24 hours before the scheduled time. Go to 'My Appointments' in your profile, select the appointment, and choose to cancel or reschedule."
    },
    {
      question: "How do I update my profile information?",
      answer: "Navigate to your profile page and click on 'Edit Profile'. You can update your personal information, contact details, and profile picture. Changes are saved automatically."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept various payment methods including UPI, credit/debit cards, net banking, and digital wallets like Paytm, PhonePe, and Google Pay. All payments are secure and encrypted."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach our customer support team through multiple channels: in-app chat, phone support, email, or WhatsApp. Our team is available 24/7 to assist you with any queries."
    }
  ];

  const supportChannels = [
    {
      title: "24/7 Phone Support",
      icon: <FaPhone className="text-2xl" />,
      description: "Call us anytime for immediate assistance",
      contact: "+91 98765 43210",
      action: "Call Now",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600"
    },
    {
      title: "Email Support",
      icon: <FaEnvelope className="text-2xl" />,
      description: "Send us an email and get a response within 2 hours",
      contact: "support@meetocure.com",
      action: "Send Email",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600"
    },
    {
      title: "WhatsApp Support",
      icon: <FaWhatsapp className="text-2xl" />,
      description: "Chat with us on WhatsApp for quick help",
      contact: "+91 98765 43210",
      action: "Chat on WhatsApp",
      color: "bg-green-600",
      hoverColor: "hover:bg-green-700"
    }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSupportAction = (channel) => {
    switch (channel.title) {
      case "24/7 Phone Support":
        window.location.href = `tel:${channel.contact}`;
        break;
      case "Email Support":
        window.location.href = `mailto:${channel.contact}`;
        break;
      case "WhatsApp Support":
        window.open(`https://wa.me/${channel.contact.replace(/\D/g, '')}`, '_blank');
        break;
      default:
        break;
    }
  };

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#E9F1F8] font-[Poppins] pb-24 md:pb-10">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-6 bg-white shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <FaArrowLeft
            onClick={() => navigate("/doctor/profile")}
            className="text-[#0A4D68] text-xl cursor-pointer hover:text-[#08374f]"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A4D68]">Help & Support</h1>
        </div>
        <TopIcons />
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <FaQuestionCircle className="text-3xl text-[#0A4D68]" />
            <h2 className="text-xl font-semibold text-[#0A4D68]">How can we help you?</h2>
          </div>
          <input
            type="text"
            placeholder="Search FAQs..."
            className="w-full px-4 py-2 border rounded-lg mb-4"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </motion.div>

        {/* Support Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {supportChannels.map((channel, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-xl shadow-sm p-6 flex flex-col items-center ${channel.color} ${channel.hoverColor} transition-colors cursor-pointer`}
              onClick={() => handleSupportAction(channel)}
            >
              {channel.icon}
              <h3 className="text-lg font-semibold mt-2 mb-1 text-white">{channel.title}</h3>
              <p className="text-sm text-white mb-2 text-center">{channel.description}</p>
              <span className="text-base font-bold text-white mb-2">{channel.contact}</span>
              <button className="bg-white text-[#0A4D68] px-3 py-1 rounded-lg font-semibold mt-2">
                {channel.action}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#0A4D68] mb-4">Frequently Asked Questions</h2>
          {filteredFAQs.length === 0 ? (
            <p className="text-gray-500">No FAQs found for your search.</p>
          ) : (
            filteredFAQs.map((faq, idx) => (
              <div key={idx} className="mb-4">
                <button
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => toggleFAQ(idx)}
                >
                  <span className="font-medium text-[#0A4D68]">{faq.question}</span>
                  {expandedFAQ === idx ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                {expandedFAQ === idx && (
                  <div className="mt-2 text-gray-600 text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
