import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaArrowLeft } from "react-icons/fa";
import { useNavigate, useLocation as useRouterLocation, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../lib/config";
import PatientTopIcons from "../../components/PatientTopIcons";
import HeroCarousel from "../../components/HeroBanners";
import SidebarNavPatient from "../../components/SidebarNavPatient";
import FloatingContactButton from "../../components/FloatingContactButton";
import CardList from './CardList';
import HospitalCardList from './hospitalpages/HospitalCard-hos';
import DoctorCardList from "./DoctorCard";




const PatientDashboard = () => {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  const [city, setCity] = useState("Vijayawada");
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [errorDoctors, setErrorDoctors] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);

  // Example static hospitals data (replace with your actual data or fetch from API)
  const allHospitalsData = [
    {
      id: 1,
      name: "City Hospital",
      specialty: "Cardiology",
      type: "Hospital",
      image: "/assets/hospitals/city-hospital.png"
    },
    {
      id: 2,
      name: "Smile Dental Clinic",
      specialty: "Dentistry",
      type: "Clinic",
      image: "/assets/hospitals/smile-dental.png"
    },
    // Add more hospital objects as needed
  ];


  useEffect(() => {
    const storedCity = localStorage.getItem("selectedCity");
    if (storedCity) setCity(storedCity);
  }, [routerLocation]);

  // Category mapping for filtering
  const categoryMapping = {
    'dentistry': ['Dentist', 'Dental', 'Dentistry'],
    'cardiology': ['Cardiologist', 'Cardiology'],
    'pulmonary': ['Pulmonologist', 'Pulmonary', 'Lungs'],
    'general': ['General', 'General Physician', 'Family Medicine', 'General Medicine'],
    'neurology': ['Neurologist', 'Neurology'],
    'gastroen': ['Gastroenterologist', 'Gastroenterology', 'Gastro'],
    'laboratory': ['Laboratory', 'Lab', 'Pathology'],
    'vaccination': ['Vaccination', 'Immunization', 'Vaccine']
  };

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setLoadingDoctors(true);
    setErrorDoctors(null);
    try {
      // Use backend to fetch doctors matching the category
      const resp = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctor`, {
        params: { category },
      });
      const mappedDoctors = resp.data.map((doc) => ({
        id: doc.doctorId,
        fullName: doc.fullName,
        primarySpecialization: doc.primarySpecialization || doc.specialization,
        category: doc.category,
        profileImage: doc.profileImage || "/assets/default-doctor.png",
      }));
      setFilteredDoctors(mappedDoctors);
    } catch (err) {
      setErrorDoctors(err.response?.data?.message || err.message);
      setFilteredDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }

    // hospitals filtering stays the same (static data)
    const searchTerms = categoryMapping[category.toLowerCase()] || [category];
    const hospitalsFiltered = allHospitalsData.filter(hospital =>
      searchTerms.some(term =>
        (hospital.specialty || '').toLowerCase().includes(term.toLowerCase()) ||
        (hospital.name || '').toLowerCase().includes(term.toLowerCase()) ||
        (hospital.type || '').toLowerCase().includes(term.toLowerCase())
      )
    );
    setFilteredHospitals(hospitalsFiltered);
  };

  const handleBackToDashboard = () => {
    setSelectedCategory(null);
    setFilteredDoctors([]);
    setFilteredHospitals([]);
  };

  const getCategoryTitle = (category) => {
    const titles = {
      'dentistry': 'Dentistry',
      'cardiology': 'Cardiology',
      'pulmonary': 'Pulmonary',
      'general': 'General Medicine',
      'neurology': 'Neurology',
      'gastroen': 'Gastroenterology',
      'laboratory': 'Laboratory',
      'vaccination': 'Vaccination',
    };
    return titles[category.toLowerCase()] || category;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No auth token found. Cannot fetch protected routes.");
      navigate("/dual-patient");
      return;
    }

    setLoadingDoctors(true);
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/doctor`)
      .then((res) => {
        const mappedDoctors = res.data.map((doc) => ({
          id: doc.doctorId,
          fullName: doc.fullName,
          primarySpecialization: doc.primarySpecialization || doc.specialization,
          category: doc.category,
          profileImage: doc.profileImage || "/assets/default-doctor.png", // fallback if no photo
        }));
        setDoctors(mappedDoctors);
        setErrorDoctors(null);
      })
      .catch((err) => {
        setErrorDoctors(err.response?.data?.message || err.message);
      })
      .finally(() => setLoadingDoctors(false));

  }, []);

  return (
    <div className="flex font-[Poppins] bg-[#F8FAFC] min-h-screen">
      <SidebarNavPatient
        handleCategoryClick={handleCategoryClick}
      />

      <div className="flex-1 min-h-screen px-6 py-6 pb-20 md:pb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col gap-2">
            {selectedCategory ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center gap-2 text-[#0A4D68] hover:text-[#08374f] transition-colors"
                >
                  <FaArrowLeft />
                  <span>Back to Dashboard</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <img
                  src="/assets/logo.png"
                  alt="Meetocure"
                  className="w-14 h-14 rounded-full object-cover shadow-md"
                />
                <h1 className="text-3xl font-bold text-[#0A4D68]">Meetocure</h1>
              </div>
            )}

            {/* Category Header or Location */}
            {selectedCategory ? (
              <div className="flex items-center gap-4 mt-4">
                <img
                  src={`/assets/categories/${categories.find(cat => cat.label.toLowerCase() === selectedCategory.toLowerCase())?.icon || 'general.png'}`}
                  alt={getCategoryTitle(selectedCategory)}
                  className="w-12 h-12"
                />
                <div>
                  <h1 className="text-3xl font-bold text-[#0A4D68]">{getCategoryTitle(selectedCategory)}</h1>
                  <div className="flex items-center gap-2 text-[#0A4D68] text-sm">
                    <FaMapMarkerAlt />
                    <span>{city}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 text-[#0A4D68] cursor-pointer hover:underline text-sm md:text-base pl-1"
                onClick={() => navigate("/location")}
              >
                <FaMapMarkerAlt />
                <span>{city}</span>
              </div>
            )}
          </div>
          <PatientTopIcons />
        </div>

        {!selectedCategory ? (
          <>
            {/* Hero */}
            <div className="mb-10">
              <HeroCarousel height="h-64" />
            </div>

            {/* Categories */}
            <SectionHeader title="Categories" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-8 mb-16">
              {categories.map((item) => (
                <div
                  key={item.label}
                  onClick={() => handleCategoryClick(item.label)}
                  className="bg-[#E0F2FE] hover:bg-[#BDE0F9] w-full h-52 rounded-3xl shadow-md flex flex-col justify-center items-center px-4 py-6 transition duration-300 ease-in-out cursor-pointer"
                >
                  <img
                    src={`/assets/categories/${item.icon}`}
                    alt={item.label}
                    className="w-12 h-12 mb-3"
                  />
                  <p className="text-base font-semibold text-gray-700 text-center">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                {selectedCategory ? (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <button
                        onClick={() => {
                          setSelectedCategory(null);
                          setFilteredDoctors([]);
                          setFilteredHospitals([]);
                        }}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <FaArrowLeft />
                        <span>Back to All Categories</span>
                      </button>
                    </div>
                    {filteredDoctors.length > 0 && (
                      <CardList title={`${selectedCategory} Doctors`} data={filteredDoctors}  type="doctor" />
                    )}
                    {filteredHospitals.length > 0 && (
                      <CardList title={`${selectedCategory} Hospitals`} data={filteredHospitals} type="hospital" />
                    )}
                    {filteredDoctors.length === 0 && filteredHospitals.length === 0 && (
                      <div className="text-center py-12">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Results Found</h3>
                        <p className="text-gray-600">No doctors or hospitals found for {selectedCategory} category.</p>
                      </div>
                    )}
                    
                  </>
                ) : (
                  <>
                    {/* <CardList title="Nearby Doctors" data={doctors} type="doctor" /> */}
                    <DoctorCardList title="Nearby Doctors" doctors={doctors} type="doctor" />
                    <HospitalCardList title="Nearby Hospitals" />
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Category Results */
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Info bar: loading, error, and counts */}
              {loadingDoctors ? (
                <div className="text-center py-4">Loading doctors...</div>
              ) : errorDoctors ? (
                <div className="text-center text-red-500 py-4">{errorDoctors}</div>
              ) : (
                <div className="flex items-center justify-between">
                 
                </div>
              )}

              {filteredDoctors.length > 0 && (
                <CardList
                  title={`${getCategoryTitle(selectedCategory)} Doctors`}
                  data={filteredDoctors}
                  type="doctor"
                />
              )}

              {filteredDoctors.length === 0 && filteredHospitals.length === 0 && !loadingDoctors && !errorDoctors && (
                <div className="text-center py-16">
                  <div className="text-gray-500 text-lg mb-4">
                    No {getCategoryTitle(selectedCategory).toLowerCase()} providers found in {city}
                  </div>
                  <button
                    onClick={handleBackToDashboard}
                    className="bg-[#0A4D68] text-white px-6 py-3 rounded-lg hover:bg-[#08374f] transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
const SectionHeader = ({ title }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-semibold text-[#1F2A37]">{title}</h2>
  </div>

);


const categories = [
  { label: "Dentistry", icon: "dentist.png" },
  { label: "Cardiology", icon: "cardiology.png" },
  { label: "Pulmonary", icon: "lungs.png" },
  { label: "General", icon: "general.png" },
  { label: "Neurology", icon: "brain.png" },
  { label: "Gastroen", icon: "stomach.png" },
  { label: "Laboratory", icon: "lab.png" },
  { label: "Vaccination", icon: "vaccine.png" }
];

export default PatientDashboard;
