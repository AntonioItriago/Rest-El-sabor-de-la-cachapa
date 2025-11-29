
import React from 'react';
import { Role } from '../types';

interface RoleSelectionScreenProps {
    onSelectRole: (role: Role) => void;
}

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectRole }) => {
    return (
        <div className="flex-grow flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl text-center animate-fade-in">
                <h1 className="text-4xl font-extrabold text-indigo-600 mb-6">El Sabor de la Cachapa</h1>
                <p className="text-gray-600 mb-8">Por favor, selecciona tu rol para continuar.</p>

                <div className="space-y-6">
                    <button
                        onClick={() => onSelectRole(Role.CLIENT)}
                        className="w-full py-4 px-6 bg-green-500 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-green-600 transition duration-200 transform hover:scale-[1.02] active:scale-95"
                    >
                        Soy Cliente
                        <span className="block text-sm font-light mt-1">Ver el menú y realizar un pedido.</span>
                    </button>
                    <button
                        onClick={() => onSelectRole(Role.WAITER)}
                        className="w-full py-4 px-6 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-600 transition duration-200 transform hover:scale-[1.02] active:scale-95"
                    >
                        Soy Mesero
                        <span className="block text-sm font-light mt-1">Gestionar pedidos de las mesas.</span>
                    </button>
                    <button
                        onClick={() => onSelectRole(Role.CASHIER)}
                        className="w-full py-4 px-6 bg-purple-500 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-purple-600 transition duration-200 transform hover:scale-[1.02] active:scale-95"
                    >
                        Soy Cajero
                        <span className="block text-sm font-light mt-1">Procesar pagos y cerrar mesas.</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionScreen;
