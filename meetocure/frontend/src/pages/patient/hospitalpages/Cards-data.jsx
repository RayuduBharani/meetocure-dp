
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HospitalCard from './HospitalCard-hos';
//import { FilterType, Hospital, SortCriteria, SortOrder } from './types';
import { SearchIcon, SortIcon } from './Icons';
import { allHospitalsData } from './HospitalsData';
import PatientTopIcons from '../../../components/PatientTopIcons';
import { FaArrowLeft } from 'react-icons/fa';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#0c4d6b]"></div>
    </div>
);

const App = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [hospitals, setHospitals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [doctorFilter, setDoctorFilter] = useState('All');
    const [sortCriteria, setSortCriteria] = useState('Default');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

    const sortDropdownRef = useRef(null);

    useEffect(() => {
        setTimeout(() => {
            setHospitals(allHospitalsData);
            setLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setIsSortDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sortedAndFilteredHospitals = useMemo(() => {
        let processedHospitals = [...hospitals];

        // Category filter
        if (activeFilter !== 'All') {
            processedHospitals = processedHospitals.filter(h => {
                if (activeFilter === 'Hospital') {
                    return h.category === 'Hospital';
                } else if (activeFilter === 'Clinic') {
                    return h.category === 'Clinic';
                } else if (activeFilter === 'Dental') {
                    return h.category === 'Dental';
                } else if (activeFilter === 'Laboratory') {
                    return h.category === 'Laboratory';
                } else if (activeFilter === 'Vaccination') {
                    return h.category === 'Vaccination';
                } else if (activeFilter === 'Ayurvedic') {
                    return h.category === 'Ayurvedic';
                } else if (activeFilter === 'Pharmacy') {
                    return h.category === 'Pharmacy';
                }
                return h.type === activeFilter;
            });
        }

        // Doctor availability filter
        if (doctorFilter !== 'All') {
            processedHospitals = processedHospitals.filter(h => {
                const doctorCount = h.doctors ? h.doctors.length : 0;
                if (doctorFilter === 'With Doctors') {
                    return doctorCount > 0;
                } else if (doctorFilter === 'No Doctors') {
                    return doctorCount === 0;
                }
                return true;
            });
        }

        // Search filter
        if (searchTerm) {
            processedHospitals = processedHospitals.filter(h =>
                h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort by favorites
        if (sortCriteria === 'Liked') {
            return processedHospitals.filter(h => h.isFavorite);
        }

        // Other sorting
        switch (sortCriteria) {
            case 'Distance':
                processedHospitals.sort((a, b) => sortOrder === 'asc' ? a.distance - b.distance : b.distance - a.distance);
                break;
            case 'Review':
                processedHospitals.sort((a, b) => sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating);
                break;
            case 'Doctors':
                processedHospitals.sort((a, b) => {
                    const aCount = a.doctors ? a.doctors.length : 0;
                    const bCount = b.doctors ? b.doctors.length : 0;
                    return sortOrder === 'asc' ? aCount - bCount : bCount - aCount;
                });
                break;
            case 'Default':
            default:
                processedHospitals.sort((a, b) => a.id - b.id);
                break;
        }

        return processedHospitals;
    }, [hospitals, searchTerm, activeFilter, doctorFilter, sortCriteria, sortOrder]);

    const handleToggleFavorite = (id) => {
        setHospitals(prev => prev.map(h => h.id === id ? { ...h, isFavorite: !h.isFavorite } : h));
    };

    const handleSortCriteriaChange = (criteria) => {
        setSortCriteria(criteria);
        setIsSortDropdownOpen(false);
    };

    const handleSortOrderChange = (order) => {
        setSortOrder(order);
        setIsSortDropdownOpen(false);
    };

    const filterOptions = ['All', 'Hospital', 'Clinic', 'Dental', 'Laboratory', 'Vaccination', 'Ayurvedic', 'Pharmacy'];

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        // <div className="bg-gray-100 w-full min-h-screen font-sans">
        <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#ECF3F9] px-6 py-8 md:px-12 text-[#1F2A37] font-poppins">
            <header className="flex items-center justify-between mb-8 border-b border-[#E2E8F0] pb-4">
                <div className="flex items-center gap-4">
                    <FaArrowLeft
                        onClick={() => navigate(-1)}
                        className="text-xl text-[#0A4D68] cursor-pointer"
                    />
                    <h1 className="text-3xl font-bold tracking-tight text-[#0A4D68]">
                        All Hospitals
                    </h1>
                </div>
                <PatientTopIcons />
            </header>

            <div className="my-6 w-full space-y-4">
                {/* Summary stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                        <div className="text-2xl font-bold text-[#0c4d6b]">{hospitals.length}</div>
                        <div className="text-sm text-gray-600">Total Hospitals</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                        <div className="text-2xl font-bold text-green-600">
                            {hospitals.reduce((total, h) => total + (h.doctors ? h.doctors.length : 0), 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Doctors</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">
                            {hospitals.filter(h => h.doctors && h.doctors.length > 0).length}
                        </div>
                        <div className="text-sm text-gray-600">Hospitals with Doctors</div>
                    </div>
                </div>

                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Hospitals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-[#697080] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0c4d6b] text-gray-900"
                    />
                </div>

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Category filters */}
                        <div className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {filterOptions.map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${activeFilter === filter
                                        ? 'bg-[#0c4d6b] text-white shadow-md'
                                        : 'bg-white text-[#0c4d6b] border border-[#0c4d6b]'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        {/* Doctor availability filters */}
                        <div className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {['All', 'With Doctors', 'No Doctors'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setDoctorFilter(filter)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${doctorFilter === filter
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'bg-white text-green-600 border border-green-600'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 flex-shrink-0 w-full md:w-auto">
                        
                        <p className="font-semibold text-sm text-gray-500">{sortedAndFilteredHospitals.length} found</p>
                        <div className="relative" ref={sortDropdownRef}>
                            <button onClick={() => setIsSortDropdownOpen(prev => !prev)} className="flex items-center space-x-1 font-semibold text-gray-600">
                                <span>{sortCriteria}</span>
                                <SortIcon className="w-4 h-4" />
                            </button>
                            {isSortDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                    <div className="py-1">
                                        {(['Default', 'Distance', 'Review', 'Doctors', 'Liked']).map(c => (
                                            <button key={c} onClick={() => handleSortCriteriaChange(c)} className={`w-full text-left px-4 py-2 text-sm ${sortCriteria === c ? 'bg-blue-100 text-[#0c4d6b]' : 'text-gray-700'} hover:bg-gray-100`}>{c}</button>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-200"></div>
                                    <div className="py-1">
                                        <button onClick={() => handleSortOrderChange('asc')} className={`w-full text-left px-4 py-2 text-sm ${sortOrder === 'asc' ? 'bg-blue-100 text-[#0c4d6b]' : 'text-gray-700'} hover:bg-gray-100`}>Ascending</button>
                                        <button onClick={() => handleSortOrderChange('desc')} className={`w-full text-left px-4 py-2 text-sm ${sortOrder === 'desc' ? 'bg-blue-100 text-[#0c4d6b]' : 'text-gray-700'} hover:bg-gray-100`}>Descending</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedAndFilteredHospitals.length > 0 ? (
                    sortedAndFilteredHospitals.map(hospital => (
                        <HospitalCard
                            key={hospital.id}
                            hospital={hospital}
                            onToggleFavorite={handleToggleFavorite}
                        />
                    ))
                ) : (
                    <div className="text-center py-16 text-gray-500 col-span-full">
                        <p className="font-semibold text-lg">No results found.</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
            {/* </div> */}
        // </div>
    );
};

export default App;
