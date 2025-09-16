import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HospitalCard from './HospitalCard-hos';
import { SearchIcon, SortIcon } from './Icons';
import PatientTopIcons from '../../../components/PatientTopIcons';
import { FaArrowLeft } from 'react-icons/fa';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#0c4d6b]"></div>
            <p className="text-gray-600 font-medium">Loading hospitals...</p>
        </div>
    </div>
);

const EmptyState = React.memo(({ onReset }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hospitals found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search terms or filters.</p>
            <button 
                onClick={onReset}
                className="px-4 py-2 bg-[#0c4d6b] text-white rounded-lg hover:bg-[#0a3d56] transition-colors"
            >
                Reset Filters
            </button>
        </div>
    </div>
));

const App = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [hospitals, setHospitals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [doctorFilter, setDoctorFilter] = useState('All');
    const [sortCriteria, setSortCriteria] = useState('Default');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef(null);
    const isInitialMount = useRef(true);

    // Prevent accidental back navigation on mobile
    useEffect(() => {
        // Prevent browser back button issues
        const handlePopState = (event) => {
            // Only prevent if we're on the hospitals page
            if (location.pathname.includes('/hospitals')) {
                event.preventDefault();
                // You can add custom logic here if needed
            }
        };

        // Add event listener for browser back button
        window.addEventListener('popstate', handlePopState);
        
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [location.pathname]);

    // Data fetching effect
    useEffect(() => {
        // Skip if component is unmounting or if this is not the initial mount
        if (!isInitialMount.current) return;
        
        const fetchHospitals = async () => {
            try {
                setLoading(true);
                // Fixed localhost URL - remove https for localhost
                const response = await fetch('http://localhost:5000/api/hospitals');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Hospitals data:', data);
                setHospitals(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching hospitals:', error);
                // Set empty array on error
                setHospitals([]);
            } finally {
                setLoading(false);
                isInitialMount.current = false;
            }
        };

        fetchHospitals();
    }, []); // Empty dependency array

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setIsSortDropdownOpen(false);
            }
        };

        if (isSortDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isSortDropdownOpen]);

    // Stable event handlers with useCallback
    const handleToggleFavorite = useCallback((id) => {
        setHospitals(prev => prev.map(h => 
            h.id === id || h._id === id ? { ...h, isFavorite: !h.isFavorite } : h
        ));
    }, []);

    const handleSortCriteriaChange = useCallback((criteria) => {
        setSortCriteria(criteria);
        setIsSortDropdownOpen(false);
    }, []);

    const handleSortOrderChange = useCallback((order) => {
        setSortOrder(order);
        setIsSortDropdownOpen(false);
    }, []);

    const handleResetFilters = useCallback(() => {
        setSearchTerm('');
        setActiveFilter('All');
        setDoctorFilter('All');
        setSortCriteria('Default');
        setSortOrder('asc');
    }, []);

    // Safe back navigation
    const handleGoBack = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Check if there's history to go back to
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            // Fallback to home page if no history
            navigate('/');
        }
    }, [navigate]);

    // Stable filter options array
    const filterOptions = useMemo(() => 
        ['All', 'Hospital', 'Clinic', 'Dental', 'Laboratory', 'Vaccination', 'Ayurvedic', 'Pharmacy'], 
        []
    );

    // Memoized filtering and sorting
    const sortedAndFilteredHospitals = useMemo(() => {
        if (!Array.isArray(hospitals) || hospitals.length === 0) return [];

        let processedHospitals = [...hospitals];
        
        // Category filter
        if (activeFilter !== 'All') {
            processedHospitals = processedHospitals.filter(h => {
                return h.category === activeFilter || h.type === activeFilter;
            });
        }

        // Doctor availability filter
        if (doctorFilter !== 'All') {
            processedHospitals = processedHospitals.filter(h => {
                const doctorCount = h.doctors ? h.doctors.length : 0;
                if (doctorFilter === 'With Doctors') return doctorCount > 0;
                if (doctorFilter === 'No Doctors') return doctorCount === 0;
                return true;
            });
        }

        // Search filter
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase().trim();
            processedHospitals = processedHospitals.filter(h =>
                h.name?.toLowerCase().includes(search) ||
                h.hospitalName?.toLowerCase().includes(search) ||
                h.specialty?.toLowerCase().includes(search) ||
                h.location?.toLowerCase().includes(search) ||
                h.address?.toLowerCase().includes(search)
            );
        }

        // Sort by favorites first
        if (sortCriteria === 'Liked') {
            processedHospitals = processedHospitals.filter(h => h.isFavorite);
        }

        // Apply sorting
        switch (sortCriteria) {
            case 'Distance':
                processedHospitals.sort((a, b) => {
                    const aDistance = a.distance || 0;
                    const bDistance = b.distance || 0;
                    return sortOrder === 'asc' ? aDistance - bDistance : bDistance - aDistance;
                });
                break;
            case 'Review':
                processedHospitals.sort((a, b) => {
                    const aRating = a.rating || 0;
                    const bRating = b.rating || 0;
                    return sortOrder === 'asc' ? aRating - bRating : bRating - aRating;
                });
                break;
            case 'Doctors':
                processedHospitals.sort((a, b) => {
                    const aCount = a.doctors ? a.doctors.length : 0;
                    const bCount = b.doctors ? b.doctors.length : 0;
                    return sortOrder === 'asc' ? aCount - bCount : bCount - aCount;
                });
                break;
            case 'Name':
                processedHospitals.sort((a, b) => {
                    const aName = a.name || a.hospitalName || '';
                    const bName = b.name || b.hospitalName || '';
                    return sortOrder === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
                });
                break;
            case 'Default':
            default:
                // Use a stable sort based on ID
                processedHospitals.sort((a, b) => {
                    const aId = a.id || a._id || 0;
                    const bId = b.id || b._id || 0;
                    return String(aId).localeCompare(String(bId));
                });
                break;
        }

        return processedHospitals;
    }, [hospitals, searchTerm, activeFilter, doctorFilter, sortCriteria, sortOrder]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#ECF3F9] px-6 py-8 md:px-12">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#ECF3F9] font-poppins">
            {/* Header - Fixed mobile touch issues */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] z-40">
                <div className="px-4 py-4 md:px-12 md:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 md:gap-4">
                            <button
                                onClick={handleGoBack}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
                                aria-label="Go back"
                                type="button"
                            >
                                <FaArrowLeft className="text-lg md:text-xl text-[#0A4D68]" />
                            </button>
                            <h1 className="text-xl md:text-3xl font-bold tracking-tight text-[#0A4D68]">
                                All Hospitals
                            </h1>
                        </div>
                        <PatientTopIcons />
                    </div>
                </div>
            </div>

            <div className="px-4 py-6 md:px-12 md:py-8">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                    <div className="bg-white rounded-xl p-4 md:p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="text-2xl md:text-3xl font-bold text-[#0c4d6b] mb-2">{hospitals.length}</div>
                        <div className="text-sm md:text-base text-gray-600 font-medium">Total Hospitals</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 md:p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
                            {hospitals.reduce((total, h) => total + (h.doctors ? h.doctors.length : 0), 0)}
                        </div>
                        <div className="text-sm md:text-base text-gray-600 font-medium">Total Doctors</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 md:p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
                            {hospitals.filter(h => h.doctors && h.doctors.length > 0).length}
                        </div>
                        <div className="text-sm md:text-base text-gray-600 font-medium">Available Now</div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-8">
                    <div className="relative mb-4 md:mb-6">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, specialty, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 md:py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c4d6b] focus:bg-white transition-all text-gray-900 placeholder-gray-500 text-sm md:text-base"
                        />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Category</h3>
                            <div className="flex flex-wrap gap-2">
                                {filterOptions.map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all touch-manipulation ${
                                            activeFilter === filter
                                                ? 'bg-[#0c4d6b] text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                        type="button"
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Doctor Availability</h3>
                            <div className="flex flex-wrap gap-2">
                                {['All', 'With Doctors', 'No Doctors'].map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setDoctorFilter(filter)}
                                        className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all touch-manipulation ${
                                            doctorFilter === filter
                                                ? 'bg-green-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                        type="button"
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between pt-6 border-t border-gray-100 mt-6 gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                Showing <span className="font-semibold text-gray-900">{sortedAndFilteredHospitals.length}</span> hospitals
                            </span>
                            {(activeFilter !== 'All' || doctorFilter !== 'All' || searchTerm) && (
                                <button
                                    onClick={handleResetFilters}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium touch-manipulation"
                                    type="button"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                        
                        <div className="relative" ref={sortDropdownRef}>
                            <button 
                                onClick={() => setIsSortDropdownOpen(prev => !prev)} 
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
                                type="button"
                            >
                                <span>Sort by {sortCriteria}</span>
                                <SortIcon className="w-4 h-4" />
                            </button>
                            {isSortDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg z-50 border border-gray-100">
                                    <div className="p-2">
                                        <div className="text-xs font-semibold text-gray-500 px-3 py-2">SORT BY</div>
                                        {['Default', 'Name', 'Distance', 'Review', 'Doctors', 'Liked'].map(criteria => (
                                            <button 
                                                key={criteria} 
                                                onClick={() => handleSortCriteriaChange(criteria)} 
                                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors touch-manipulation ${
                                                    sortCriteria === criteria 
                                                        ? 'bg-blue-50 text-[#0c4d6b] font-medium' 
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                                type="button"
                                            >
                                                {criteria}
                                            </button>
                                        ))}
                                        <div className="border-t border-gray-100 my-2"></div>
                                        <div className="text-xs font-semibold text-gray-500 px-3 py-2">ORDER</div>
                                        <button 
                                            onClick={() => handleSortOrderChange('asc')} 
                                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors touch-manipulation ${
                                                sortOrder === 'asc' 
                                                    ? 'bg-blue-50 text-[#0c4d6b] font-medium' 
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                            type="button"
                                        >
                                            Ascending
                                        </button>
                                        <button 
                                            onClick={() => handleSortOrderChange('desc')} 
                                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors touch-manipulation ${
                                                sortOrder === 'desc' 
                                                    ? 'bg-blue-50 text-[#0c4d6b] font-medium' 
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                            type="button"
                                        >
                                            Descending
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Hospital Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                    {sortedAndFilteredHospitals.length > 0 ? (
                        sortedAndFilteredHospitals.map(hospital => (
                            <div key={hospital.id || hospital._id} className="w-full">
                                <HospitalCard
                                    hospital={hospital}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            </div>
                        ))
                    ) : (
                        <EmptyState onReset={handleResetFilters} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
