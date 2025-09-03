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

const Help = () => {
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
            onClick={() => navigate("/patient/profile")}
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
          className="bg-white rounded-xl shadow-sm p-6 mb-6 text-center"
        >
          <div className="w-20 h-20 bg-[#0A4D68] rounded-full flex items-center justify-center mx-auto mb-4">
            <FaQuestionCircle className="text-white text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-[#0A4D68] mb-3">How can we help you?</h2>
          <p className="text-gray-600">
            We're here to help! Find answers to common questions or get in touch with our support team.
          </p>
        </motion.div>

        {/* Support Channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-[#0A4D68] mb-4">Get Support</h3>
          <div className="grid md:grid-cols-2 gap-4 ">
            {supportChannels.map((channel, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6 justify-items-center hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${channel.color} text-white`}>
                    {channel.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{channel.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{channel.description}</p>
                    <p className="text-[#0A4D68] font-medium mb-3">{channel.contact}</p>
                    <button
                      onClick={() => handleSupportAction(channel)}
                      className={`px-4 py-2 ${channel.color} ${channel.hoverColor} text-white rounded-lg transition-colors text-sm font-medium`}
                    >
                      {channel.action}
                    </button>
                  </div>
                </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-[#0A4D68] mb-4">Frequently Asked Questions</h3>

          {/* Search Bar */}
          <div className="relative mb-6">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A4D68] focus:border-transparent"
            />
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFAQ === index ? (
                    <FaChevronUp className="text-[#0A4D68]" />
                  ) : (
                    <FaChevronDown className="text-[#0A4D68]" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {filteredFAQs.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <p className="text-gray-500">No FAQs found matching your search.</p>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 text-[#0A4D68] hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-[#0A4D68] mb-4">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Office Hours</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaClock className="text-[#0A4D68]" />
                  <span>Monday - Friday: 9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-[#0A4D68]" />
                  <span>Saturday: 9:00 AM - 2:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-[#0A4D68]" />
                  <span>Sunday: Closed</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Office Location</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <FaMapMarkerAlt className="text-[#0A4D68] mt-1" />
                  <div>
                    <p>Meetocure Healthcare Pvt. Ltd.</p>
                    <p>Vijayawada, Andhra Pradesh, India</p>
                    <p>PIN: 520001</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#0A4D68] to-[#08374f] rounded-xl shadow-sm p-6 mb-8 text-center text-white"
        >
          <h3 className="text-xl font-semibold mb-3">Still need help?</h3>
          <p className="mb-4 opacity-90">
            Can't find what you're looking for? Our support team is here to help you 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.href = "tel:+919876543210"}
              className="px-6 py-3 bg-white text-[#0A4D68] rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Call Support
            </button>
            <Link to="/patient/chat">
            <button
              onClick={() => navigate("/patient/ai-chat")}
              className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-[#0A4D68] transition-colors font-medium"
            >
              Start Chat
            </button>
            </Link>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-8 mb-8"
        >
          <button
            onClick={() => navigate("/patient/profile")}
            className="px-6 py-3 border border-[#0A4D68] text-[#0A4D68] rounded-xl hover:bg-[#0A4D68] hover:text-white transition-colors font-medium"
          >
            Back to Profile
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Help;
