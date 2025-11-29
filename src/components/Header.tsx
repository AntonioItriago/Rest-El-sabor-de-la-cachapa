
import React from 'react';
import { type SessionInfo } from '../types';
import { formatPrice } from '../utils/formatters';
import { BCV_RATE } from '../constants';

interface HeaderProps {
    title: string;
    sessionInfo: SessionInfo;
    onExit: () => void;
    isWaiter?: boolean;
    onEditClientName?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, sessionInfo, onExit, isWaiter = false, onEditClientName }) => {
    const { tableNumber, waiterId, clientName } = sessionInfo;

    return (
        <header className="shadow-md bg-white p-4 sticky top-0 z-20">
            <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
                <div className="flex flex-col items-center text-center md:text-left md:items-start md:flex-row md:items-center mb-2 md:mb-0">
                    <h1 className={`text-2xl font-bold ${isWaiter ? 'text-blue-700' : 'text-indigo-700'} mr-4`}>{title}</h1>
                    <span className="text-sm font-medium text-slate-600 mt-1 md:mt-0 flex flex-wrap items-center justify-center">
                        {tableNumber && (
                            <>
                                <span>Mesa:</span>
                                <span className="font-bold mx-1.5">{tableNumber}</span>
                                <span className="text-slate-300 mx-1">|</span>
                            </>
                        )}
                        <span>{isWaiter ? "Usuario:" : "Mesonero:"}</span>
                        <span className="font-bold mx-1.5">{waiterId}</span>
                        
                        {onEditClientName && (
                            <span className="flex items-center">
                                <span className="text-slate-300 mx-1">|</span>
                                {clientName ? (
                                    <>
                                        <span>Cliente:</span>
                                        <span className="font-bold ml-1.5">{clientName}</span>
                                        <button onClick={onEditClientName} className="ml-2 text-slate-500 hover:text-indigo-600" title="Editar nombre">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                                            </svg>
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={onEditClientName} className="text-sm font-medium text-indigo-600 hover:text-indigo-800" title="Añadir tu nombre">
                                        [+] Añadir Nombre
                                    </button>
                                )}
                            </span>
                        )}
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="hidden sm:block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-bold text-sm">
                        BCV: {formatPrice(BCV_RATE, 'VES')}
                    </span>
                     <button onClick={onExit} className="text-sm text-slate-500 hover:text-slate-700 transition">
                        &larr; Salir
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
