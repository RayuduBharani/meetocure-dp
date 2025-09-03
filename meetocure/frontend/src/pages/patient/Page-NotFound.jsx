import React from "react";
import { Link } from "react-router-dom";

export default function PageNotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-100 to-blue-100 px-4">
            <div className="text-8xl font-extrabold text-teal-700 drop-shadow-lg mb-4">404</div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Page Not Found</h1>
            <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
                Oops! The page you're looking for doesn't exist or has been moved.<br />
                Please check the URL or return to the homepage.
            </p>
            <Link to="/" className="inline-block bg-teal-700 hover:bg-teal-800 text-white font-semibold px-8 py-3 rounded-full shadow transition-all duration-200">
                Go Home
            </Link>
            <div className="mt-12">
                <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="90" cy="110" rx="70" ry="10" fill="#D1FAE5" />
                    <circle cx="60" cy="70" r="30" fill="#5EEAD4" />
                    <rect x="110" y="50" width="40" height="40" rx="8" fill="#38BDF8" />
                    <circle cx="130" cy="70" r="10" fill="#F472B6" />
                </svg>
            </div>
        </div>
    );
}