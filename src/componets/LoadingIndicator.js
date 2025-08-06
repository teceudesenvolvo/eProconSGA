import React from 'react';
import { useLoading } from './LoadingContext'; // Importe o hook useLoading

const LoadingIndicator = () => {
    const { isLoading } = useLoading();

    if (!isLoading) return null; // Não renderiza nada se não estiver a carregar

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p className="text-gray-700 text-lg font-semibold">A carregar...</p>
            </div>
        </div>
    );
};

export default LoadingIndicator;
