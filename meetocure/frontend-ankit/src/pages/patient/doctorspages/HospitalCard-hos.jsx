
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, HospitalIcon, LocationPinIcon, RouteIcon, StarIcon, UserIcon } from './Icons';

const StarRating = ({ rating }) => {
    const totalStars = 5;
    return (
        <div className="flex items-center">
            {Array.from({ length: totalStars }, (_, index) => (
                <StarIcon key={index} className={`w-4 h-4 ${index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
            ))}
        </div>
    );
};

const HospitalCard = ({ hospital, onToggleFavorite }) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const navigate = useNavigate();

    const handleCardClick = () => {
        // Navigate to hospital doctors page
        navigate(`/hospital/${hospital.id}/doctors`);
    };

    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        onToggleFavorite(hospital.id);
    };

    return (
        <div
            className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-200 cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="relative">
                <img
                    className="w-full h-48 object-cover"
                    src={hospital.image || hospital.imageUrl}
                    alt={hospital.name}
                    onLoad={() => setIsImageLoaded(true)}
                    loading="lazy"
                />
                <button
                    onClick={handleFavoriteClick}
                    className="absolute top-3 right-3 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center text-red-500 transition-colors hover:bg-white"
                    aria-label={hospital.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    <HeartIcon className={`w-4 h-4 ${hospital.isFavorite ? 'text-red-500' : 'text-red-500 hover:text-red-500'}`} isFilled={hospital.isFavorite} />
                </button>
                
            </div>
            <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{hospital.name}</h3>
                <p className="text-gray-600 text-sm mb-1">{hospital.specialty || hospital.type}</p>
                <p className="text-gray-500 text-sm mb-2">{hospital.location}</p>
                <div className="flex items-center gap-1 mb-2">
                    <StarRating rating={hospital.rating} />
                    <span className="text-sm text-gray-600 ml-1">({hospital.reviews})</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">

                </div>
            </div>
        </div>
    );
};

export default HospitalCard;
