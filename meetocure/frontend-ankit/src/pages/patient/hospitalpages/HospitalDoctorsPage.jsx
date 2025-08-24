import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaMapMarkerAlt, FaClock, FaPhone, FaUser, FaCalendarAlt, FaHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { allDoctorsData } from '../doctorspages/DoctorsData';
import { allHospitalsData } from './HospitalsData';
import PatientTopIcons from '../../../components/PatientTopIcons';

const DoctorCard = ({ doctor }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        // Navigate to doctor details page
        navigate(`/details/doctor/${doctor.id}`);
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= doctor.rating) {
                stars.push(
                    <FaStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                );
            } else {
                stars.push(
                    <FaStar key={i} className="w-4 h-4 text-gray-300" />
                );
            }
        }
        return stars;
    };

    return (
        <div
            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-200 cursor-pointer hover:shadow-xl"
            onClick={handleCardClick}
        >
            <div className="relative">
                <img
                    className="w-full h-48 object-cover"
                    src={doctor.imageUrl}
                    alt={doctor.name}
                />
            </div>
            <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{doctor.name}</h3>
                <p className="text-gray-600 text-sm mb-1">{doctor.specialty}</p>
                <p className="text-gray-500 text-sm mb-2">{doctor.location}</p>
                <div className="flex items-center gap-1 mb-2">
                    {renderStars()}
                    <span className="text-sm text-gray-600 ml-1">({doctor.rating})</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Experience: {doctor.experience}</span>
                    <span>{doctor.distanceText}</span>
                </div>
            </div>
        </div>
    );
};

const HospitalCard = ({ hospital, onCardClick }) => {
    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= hospital.rating) {
                stars.push(
                    <FaStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                );
            } else {
                stars.push(
                    <FaStar key={i} className="w-4 h-4 text-gray-300" />
                );
            }
        }
        return stars;
    };

    return (
        <div
            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-200 cursor-pointer hover:shadow-xl"
            onClick={() => onCardClick(hospital)}
        >
            <div className="relative">
                <img
                    className="w-full h-48 object-cover"
                    src={hospital.imageUrl}
                    alt={hospital.name}
                />
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium ${hospital.doctors && hospital.doctors.length > 0
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-400 text-white'
                    }`}>
                    {hospital.doctors && hospital.doctors.length > 0
                        ? `${hospital.doctors.length} Doctor${hospital.doctors.length !== 1 ? 's' : ''}`
                        : 'No Doctors'
                    }
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{hospital.name}</h3>
                <p className="text-gray-600 text-sm mb-1">{hospital.specialty}</p>
                <p className="text-gray-500 text-sm mb-2">{hospital.location}</p>
                <div className="flex items-center gap-1 mb-2">
                    {renderStars()}
                    <span className="text-sm text-gray-600 ml-1">({hospital.rating})</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {hospital.category}
                    </span>
                    <span>{hospital.distanceText}</span>
                </div>
            </div>
        </div>
    );
};

const HospitalDoctorsPage = () => {
    const { hospitalId } = useParams();
    const navigate = useNavigate();
    const [hospital, setHospital] = useState(null);
    const [hospitalDoctors, setHospitalDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [filteredHospitals, setFilteredHospitals] = useState([]);

    // Category mapping for filtering - same as PatientDashboard
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

    // Hospital categories - same structure as PatientDashboard


    useEffect(() => {
        try {
            // Find the hospital data
            const foundHospital = allHospitalsData.find(h => h.id === hospitalId);
            console.log('Hospital ID from params:', hospitalId);
            console.log('Found hospital:', foundHospital);

            if (foundHospital) {
                setHospital(foundHospital);

                // Find doctors working at this hospital
                if (foundHospital.doctors && foundHospital.doctors.length > 0) {
                    const doctors = allDoctorsData.filter(doctor =>
                        foundHospital.doctors.includes(doctor.id)
                    );
                    console.log('Hospital doctors array:', foundHospital.doctors);
                    console.log('Filtered doctors:', doctors);
                    setHospitalDoctors(doctors);
                } else {
                    console.log('No doctors assigned to this hospital');
                    setHospitalDoctors([]);
                }
            } else {
                console.log('Hospital not found for ID:', hospitalId);
                setError('Hospital not found');
            }
        } catch (err) {
            console.error('Error loading hospital data:', err);
            setError('Error loading hospital data');
        } finally {
            setLoading(false);
        }
    }, [hospitalId]);

    const handleHospitalCardClick = (hospital) => {
        navigate(`/hospital/${hospital.id}/doctors`);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#0c4d6b] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading hospital information...</p>
                </div>
            </div>
        );
    }

    if (error || !hospital) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FaUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">Hospital Not Found</h4>
                    <p className="text-gray-500 mb-4">{error || 'The requested hospital could not be found.'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-[#0c4d6b] text-white px-6 py-2 rounded-lg hover:bg-[#08374f] transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-8xl mx-auto px-8 py-4">
                    <div className="flex items-center justify-between space-x-4 pr-5">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <FaArrowLeft className="w-4 h-4 text-gray-600" />
                            </button>
                            <div >
                                <h1 className="text-xl font-bold text-gray-800">{hospital.name}</h1>
                                <p className="text-gray-600">{hospital.specialty} • {hospital.location}</p>
                            </div>
                        </div>
                        <PatientTopIcons />
                    </div>
                </div>
            </div>

            {/* Hospital Info Card */}
            <div className="max-w-8xl mx-auto px-12 py-6">
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex items-start space-x-6">
                        <img
                            src={hospital.imageUrl}
                            alt={hospital.name}
                            className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div className="flex-2">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{hospital.name}</h2>
                            <p className="text-gray-600 mb-3">{hospital.about}</p>
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center space-x-2">
                                    <FaMapMarkerAlt className="text-gray-500" />
                                    <span>{hospital.location}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FaClock className="text-gray-500" />
                                    <span>{hospital.workingHours}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FaPhone className="text-gray-500" />
                                    <span>{hospital.contact}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FaUser className="text-gray-500" />
                                    <span>{hospitalDoctors.length} Doctors</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Doctors Section */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Available Doctors ({hospitalDoctors.length})
                    </h3>
                    {hospitalDoctors.length === 0 ? (
                        <div className="text-center py-12">
                            <FaUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-gray-600 mb-2">No Doctors Available</h4>
                            <p className="text-gray-500 mb-4">This hospital currently doesn't have any doctors assigned.</p>
                            <button
                                onClick={() => navigate(-1)}
                                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Go Back
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {hospitalDoctors.map((doctor) => (
                                <DoctorCard
                                    key={doctor.id}
                                    doctor={doctor}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Categorized Hospitals Section */}

            </div>
        </div>
    );
};

export default HospitalDoctorsPage;
