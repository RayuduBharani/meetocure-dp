import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import HospitalCard from './doctorspages/HospitalCard-hos';

const CardList = ({ title, data, type, seeAllLink }) => {
    const initialVisibleCount = 4; // Show 4 cards initially for a better look
    const itemsToShow = data.slice(0, initialVisibleCount);
    const [favorites, setFavorites] = useState({});

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
                <Link
                    to={type === "doctor" ? "/doctorspages/Cards-data" : "/hospitalpages/Cards-data"}
                    className="text-sm text-[#0A4D68] hover:underline font-medium"
                >
                    See All
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {itemsToShow.map((item) => {
                    if (type === "hospital") {
                        return (
                            <HospitalCard
                                key={item.id}
                                hospital={{...item, isFavorite: favorites[item.id] || false}}
                                onToggleFavorite={toggleFavorite}
                            />
                        );
                    } else {
                        return (
                            <Link to={`/details/${type}/${item.id}`} key={item.id}>
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