import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="text-center bg-white dark:bg-gray-800 p-6 rounded shadow transition-colors">
            <h1 className="text-4xl font-bold mb-6">Welcome to Image Uploader</h1>
            <p className="text-lg mb-4 text-gray-600 dark:text-gray-300">Upload and view your favorite moments</p>
            <div className="space-x-4">
                <Link to="/upload" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Upload Image</Link>
                <Link to="/gallery" className="px-4 py-2 bg-gray-300 dark:bg-gray-700 dark:text-white text-black rounded hover:bg-gray-400 dark:hover:bg-gray-600">View Gallery</Link>
            </div>
        </div>
    );
};

export default HomePage;