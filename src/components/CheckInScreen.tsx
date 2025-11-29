import React, { useState } from 'react';
import { Role, type SessionInfo } from '../types';
import { useData } from '../context/DataContext';

interface CheckInScreenProps {
    role: Role;
    onSubmit: (info: SessionInfo) => void;
    onBack: () => void;
}

const CheckInScreen: React.FC<CheckInScreenProps> = ({ role, onSubmit, onBack }) => {
    const [employeeId, setEmployeeId] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [clientName, setClientName] = useState('');
    const [error, setError] = useState('');

    const { tableAssignments } = useData();

    const isClient = role === Role.CLIENT;
    const isWaiter = role === Role.WAITER;
    const isCashier = role === Role.CASHIER;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isClient) {
            if (!tableNumber) {
                setError('El número de mesa es obligatorio.');
                return;
            }
            const assignedWaiter = tableAssignments[tableNumber];
            if (assignedWaiter === undefined) {
                setError(`La mesa #${tableNumber} no es válida.`);
                return;
            }
            if (!assignedWaiter) {
                setError(`La mesa #${tableNumber} no tiene un mesero asignado. Por favor, consulte al personal.`);
                return;
            }
            onSubmit({
                waiterId: assignedWaiter,
                tableNumber,
                clientName: clientName || undefined,
            });
        } else { // Waiter or Cashier
            if (!employeeId) {
                setError('El nombre o ID es obligatorio.');
                return;
            }
            onSubmit({
                waiterId: employeeId,
                tableNumber: tableNumber || undefined,
            });
        }
    };
    
    let title = '';
    let employeeLabel = '';
    let employeePlaceholder = '';
    let buttonText = '';

    if (isClient) {
        title = 'Bienvenido';
        buttonText = 'Ver Menú';
    } else if (isWaiter) {
        title = 'Ingreso de Mesero';
        employeeLabel = 'Tu Nombre o ID (Obligatorio):';
        employeePlaceholder = 'Ej. Juan Pérez';
        buttonText = 'Gestionar Mesas';
    } else if (isCashier) {
        title = 'Ingreso de Cajero';
        employeeLabel = 'Tu Nombre o ID (Obligatorio):';
        employeePlaceholder = 'Ej. Ana Gómez';
        buttonText = 'Abrir Caja';
    }


    return (
        <div className="flex-grow flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl animate-fade-in">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">{title}</h2>
                <form onSubmit={handleSubmit} noValidate>
                    {isClient && (
                        <>
                            <div className="mb-4">
                                <label htmlFor="table-number" className="block text-sm font-medium text-gray-700 mb-2">
                                    Número de Mesa (Obligatorio):
                                </label>
                                <input
                                    type="number"
                                    id="table-number"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    required
                                    min="1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Ej. 5"
                                />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="client-name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tu Nombre (Opcional):
                                </label>
                                <input
                                    type="text"
                                    id="client-name"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Ej. María López"
                                />
                            </div>
                        </>
                    )}

                    {!isClient && (
                         <>
                            <div className="mb-4">
                                <label htmlFor="employee-id" className="block text-sm font-medium text-gray-700 mb-2">
                                {employeeLabel}
                                </label>
                                <input
                                    type="text"
                                    id="employee-id"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder={employeePlaceholder}
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="table-number" className="block text-sm font-medium text-gray-700 mb-2">
                                    Filtrar por Mesa (Opcional):
                                </label>
                                <input
                                    type="number"
                                    id="table-number"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    min="1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Ver solo la mesa (ej. 5)"
                                />
                            </div>
                        </>
                    )}


                    {error && <p className="text-red-500 text-center mb-3 text-sm">{error}</p>}
                    
                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition duration-200"
                    >
                        {buttonText}
                    </button>
                    <button
                        type="button"
                        onClick={onBack}
                        className="w-full py-3 mt-4 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-200"
                    >
                        &larr; Cambiar Rol
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CheckInScreen;
