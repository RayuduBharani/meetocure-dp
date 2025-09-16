import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import HospitalCard from './doctorspages/HospitalCard-hos';

const CardList = ({ title, data = [], type}) => {
    const initialVisibleCount = 4; // Show 4 cards initially for a better look
    const itemsToShow = Array.isArray(data) ? data.slice(0, initialVisibleCount) : [];
    const [favorites, setFavorites] = useState({});

    // normalize hosData which may be an array or a number
 
    const doctorsCount = Array.isArray(data) ? data.length : (typeof data === 'number' ? data : 0);

    const toggleFavorite = (id) => {
        setFavorites(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-[#1F2A37]">{title}</h2>
                <div className="text-sm text-gray-600">
                    {/* Display totals: doctors • hospitals */}
                    {doctorsCount} {doctorsCount === 1 ? 'doctor' : 'doctors'} 
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {itemsToShow.map((item) => {
                    if (type === "hospital") {
                        return (
                            <HospitalCard
                                key={item.id || item._id}
                                hospital={{...item, isFavorite: favorites[item.id || item._id] || false}}
                                onToggleFavorite={toggleFavorite}
                            />
                        );
                    } else {
                        return (
                            <Link to={`/details/${type}/${item.id}`} key={item.id || item._id}>
                                <Card
                                    image={item.profileImage}
                                    name={item.fullName}
                                    specialty={item.category || item.type}
                                    location={item.location}
                                    rating={3}
                                />
                            </Link>
                        );
                    }
                })}
            </div>
        </div>
    );
};

export default CardList;