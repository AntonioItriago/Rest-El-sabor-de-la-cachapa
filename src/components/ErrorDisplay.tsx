
import React from 'react';

interface ErrorDisplayProps {
    message: string;
    onRetry?: () => void;
    onReset?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry, onReset }) => {
    return (
        <div className="flex-grow flex items-center justify-center p-4">
            <div className="p-6 bg-red-100 text-red-700 rounded-xl m-8 max-w-lg mx-auto shadow-xl text-center">
                <p className="font-bold text-lg mb-2">❌ Error</p>
                <p>{message}</p>
                <div className="mt-4 flex justify-center space-x-4">
                    {onRetry && (
                         <button onClick={onRetry} className="py-2 px-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition">
                            Reintentar
                        </button>
                    )}
                     {onReset && (
                         <button onClick={onReset} className="py-2 px-4 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition">
                            Volver al Inicio
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorDisplay;