import React, { useState, useMemo } from 'react';
import { type SessionInfo, type Order, OrderStatus, type ModalContent } from '../types';
import Header from './Header';
import Modal from './Modal';
import { formatPrice, convertToVes } from '../utils/formatters';
import { useData } from '../context/DataContext';

interface CashierViewProps {
    sessionInfo: SessionInfo;
    onExit: () => void;
}

const CashierView: React.FC<CashierViewProps> = ({ sessionInfo, onExit }) => {
    const { orders, waiters, setWaiters, handleClearTable, handleReassignTable } = useData();
    const [modalContent, setModalContent] = useState<ModalContent | null>(null);
    const [reassignModal, setReassignModal] = useState<{ open: boolean; tableNumber: string; currentWaiter: string; }>({ open: false, tableNumber: '', currentWaiter: '' });
    const [newWaiterId, setNewWaiterId] = useState('');
    const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
    const [newWaiterName, setNewWaiterName] = useState('');
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [closeTableModal, setCloseTableModal] = useState<{ open: boolean; tableNumber: string | null }>({ open: false, tableNumber: null });
    
    const activeTables = useMemo(() => {
        const tables: { [key: string]: { waiterId: string, clientName?: string, orders: Order[], total: number } } = {};
        const ordersToProcess = sessionInfo.tableNumber ? orders.filter(o => o.tableNumber === sessionInfo.tableNumber) : orders;

        ordersToProcess.forEach(order => {
            if (order.status !== OrderStatus.PAID) {
                 if (!tables[order.tableNumber]) {
                    tables[order.tableNumber] = { waiterId: order.waiterId, clientName: order.clientName, orders: [], total: 0 };
                }
                tables[order.tableNumber].orders.push(order);
                if (order.status !== OrderStatus.PENDING) {
                    tables[order.tableNumber].total += order.total;
                }
            }
        });
        return tables;
    }, [orders, sessionInfo.tableNumber]);
    
    const confirmCloseTable = () => {
        if (closeTableModal.tableNumber) {
            handleClearTable(closeTableModal.tableNumber);
            setSelectedTable(null);
            setCloseTableModal({ open: false, tableNumber: null });
            setModalContent({
                title: '✅ Mesa Cerrada',
                message: `La mesa **#${closeTableModal.tableNumber}** ha sido cerrada y está lista para un nuevo cliente.`,
                type: 'success'
            });
        }
    };

    const handleOpenReassignModal = (tableNumber: string, currentWaiter: string) => {
        setNewWaiterId('');
        setReassignModal({ open: true, tableNumber, currentWaiter });
    };

    const handleReassignSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newWaiterId.trim()) {
            handleReassignTable(reassignModal.tableNumber, newWaiterId.trim());
            setReassignModal({ open: false, tableNumber: '', currentWaiter: '' });
             setModalContent({
                title: '✅ Reasignación Exitosa',
                message: `La mesa **${reassignModal.tableNumber}** ha sido reasignada al mesero **${newWaiterId.trim()}**.`,
                type: 'success'
            });
        }
    };
    
    const handleAddWaiter = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = newWaiterName.trim();
        if (trimmedName && !waiters.includes(trimmedName)) {
            setWaiters(prev => [...prev, trimmedName].sort());
            setNewWaiterName('');
        }
    };

    const handleDeleteWaiter = (waiterToDelete: string) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar al mesero "${waiterToDelete}"?`)) {
            setWaiters(prev => prev.filter(w => w !== waiterToDelete));
        }
    };

    const getStatusChipColor = (status: OrderStatus) => {
        const colors: Partial<Record<OrderStatus, string>> = {
            [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
            [OrderStatus.APPROVED]: 'bg-green-100 text-green-800',
            [OrderStatus.DELIVERED]: 'bg-blue-100 text-blue-800',
            [OrderStatus.BILL_REQUESTED]: 'bg-red-100 text-red-800',
            [OrderStatus.PAID]: 'bg-purple-100 text-purple-800',
        };
        return colors[status] || 'bg-slate-100 text-slate-800';
    };
    
    const selectedTableData = selectedTable ? activeTables[selectedTable] : null;

    const canCloseTable = useMemo(() => {
        if (!selectedTableData) return false;
        const isBillRequested = selectedTableData.orders.some(o => o.status === OrderStatus.BILL_REQUESTED);
        const allItemsFinalized = selectedTableData.orders.every(o => 
            o.status === OrderStatus.DELIVERED || o.status === OrderStatus.BILL_REQUESTED
        );
        return isBillRequested && allItemsFinalized;
    }, [selectedTableData]);

    return (
        <>
            <Header 
                title={sessionInfo.tableNumber ? `Caja - Mesa ${sessionInfo.tableNumber}` : "Caja - Todas las Mesas"} 
                sessionInfo={sessionInfo} 
                onExit={onExit} 
                isWaiter={true} 
            />
            <main className="max-w-7xl mx-auto p-4 w-full">
                {!selectedTable ? (
                     <section>
                        <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
                                <h2 className="text-2xl font-bold text-slate-800">Gestión de Mesas Activas</h2>
                                {!sessionInfo.tableNumber && (
                                    <button onClick={() => setIsWaiterModalOpen(true)} className="py-1 px-4 text-sm bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition">
                                        Gestionar Mesoneros
                                    </button>
                                )}
                        </div>
                        {Object.keys(activeTables).length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 rounded-lg"><p className="text-slate-500">No hay mesas con consumo activo.</p></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(activeTables).map(([tableNum, data]) => {
                                    const isBillRequested = data.orders.some(o => o.status === OrderStatus.BILL_REQUESTED);
                                    return (
                                    <button key={tableNum} onClick={() => setSelectedTable(tableNum)} className={`p-4 bg-white rounded-lg shadow border text-left transition hover:shadow-md hover:border-indigo-500 ${isBillRequested ? 'border-red-500 animate-pulse-slow' : 'border-slate-200'}`}>
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-lg">Mesa {tableNum}</h3>
                                            {isBillRequested && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800">Solicitando Cuenta</span>}
                                        </div>
                                        <p className="text-sm text-slate-600">Mesero: <span className="font-semibold">{data.waiterId}</span></p>
                                        <p className="text-sm text-slate-600 mt-1">
                                            Total: <strong className="text-md">{formatPrice(data.total, 'USD')}</strong> 
                                            <span className="text-green-600"> / {formatPrice(convertToVes(data.total), 'VES')}</span>
                                        </p>
                                    </button>
                                )})}
                            </div>
                        )}
                    </section>
                ) : (
                    selectedTableData && (
                        <section className="bg-white rounded-lg shadow-lg p-6 border border-slate-200 animate-fade-in">
                           <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
                                <h2 className="font-bold text-2xl">Mesa {selectedTable}</h2>
                                <button onClick={() => setSelectedTable(null)} className="py-2 px-4 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition flex items-center text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Ver todas las mesas
                                </button>
                            </div>
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-slate-600">Mesero Actual: <span className="font-semibold">{selectedTableData.waiterId}</span></p>
                                    {selectedTableData.clientName && <p className="text-sm text-slate-600">Cliente: <span className="font-semibold">{selectedTableData.clientName}</span></p>}
                                    <div className="text-slate-600 mt-2">
                                        <span className="text-lg font-semibold">Total a Pagar:</span>
                                        <p className="font-extrabold text-3xl text-slate-900">{formatPrice(selectedTableData.total, 'USD')}</p>
                                        <p className="font-bold text-2xl text-green-600">{formatPrice(convertToVes(selectedTableData.total), 'VES')}</p>
                                    </div>
                                    {selectedTableData.orders.find(o => o.status === OrderStatus.BILL_REQUESTED)?.paymentMethod && (
                                        <p className="text-sm font-semibold text-red-700 mt-1">
                                            Forma de Pago Solicitada: <span className="font-bold">{selectedTableData.orders.find(o => o.status === OrderStatus.BILL_REQUESTED)!.paymentMethod}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                    <button onClick={() => handleOpenReassignModal(selectedTable, selectedTableData.waiterId)} className="py-2 px-4 text-sm bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition w-full md:w-auto">Reasignar</button>
                                    <button 
                                        onClick={() => setCloseTableModal({open: true, tableNumber: selectedTable})} 
                                        className="py-2 px-6 bg-purple-500 text-white font-bold rounded-lg transition shadow-md active:scale-95 w-full md:w-auto disabled:bg-slate-400 disabled:cursor-not-allowed"
                                        disabled={!canCloseTable}
                                        title={!canCloseTable ? 'La cuenta debe ser solicitada y todos los items entregados' : 'Cobrar y cerrar mesa'}
                                    >Cobrar y Cerrar Mesa</button>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg mb-2 border-t border-slate-200 pt-4">Detalle de Pedidos</h3>
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                               {selectedTableData.orders.map(order => (
                                   <div key={order.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                       <div className="flex justify-between items-center mb-2">
                                           <span className="font-semibold text-sm">Pedido #{order.id.substring(0,6)}</span>
                                           <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusChipColor(order.status)}`}>{order.status}</span>
                                       </div>
                                       <ul>{order.items.map(item => (
                                           <li key={item.id} className="text-sm text-slate-700 flex justify-between">
                                               <span>{item.name} x{item.quantity}</span>
                                               <span>{formatPrice(item.price * item.quantity, 'USD')}</span>
                                           </li>
                                       ))}</ul>
                                   </div>
                               ))}
                            </div>
                        </section>
                    )
                )}
            </main>
             {modalContent && <Modal isOpen={!!modalContent} onClose={() => setModalContent(null)} title={modalContent.title} message={modalContent.message} type={modalContent.type} />}
             
             {closeTableModal.open && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full animate-fade-in">
                        <div className="p-4 border-b">
                            <h3 className="text-lg font-bold text-slate-800">Confirmar Cierre de Mesa</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-700" dangerouslySetInnerHTML={{ __html: `¿Está seguro de que desea cobrar y cerrar la mesa <strong>#${closeTableModal.tableNumber}</strong>? Esta acción es irreversible y eliminará todos sus pedidos.` }}></p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-b-xl flex justify-end space-x-3">
                            <button onClick={() => setCloseTableModal({ open: false, tableNumber: null })} className="py-2 px-4 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition">Cancelar</button>
                            <button onClick={confirmCloseTable} className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">Confirmar y Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

             {isWaiterModalOpen && (
                 <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="p-4 border-b"><h3 className="text-lg font-bold text-slate-800">Gestionar Mesoneros</h3></div>
                        <div className="p-6 max-h-80 overflow-y-auto">
                            <ul className="space-y-2 mb-4">
                                {waiters.map(waiter => (
                                    <li key={waiter} className="flex justify-between items-center p-2 bg-slate-100 rounded">
                                        <span className="text-slate-800 font-medium">{waiter}</span>
                                        <button onClick={() => handleDeleteWaiter(waiter)} className="text-red-500 hover:text-red-700 font-bold">Eliminar</button>
                                    </li>
                                ))}
                            </ul>
                            <form onSubmit={handleAddWaiter} className="flex space-x-2">
                                <input type="text" value={newWaiterName} onChange={e => setNewWaiterName(e.target.value)} placeholder="Nuevo mesero" className="flex-grow px-3 py-2 border border-slate-300 rounded-lg" required />
                                <button type="submit" className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600">Añadir</button>
                            </form>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-b-xl text-right">
                            <button type="button" onClick={() => setIsWaiterModalOpen(false)} className="py-2 px-4 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition">Cerrar</button>
                        </div>
                    </div>
                </div>
             )}

            {reassignModal.open && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full">
                        <form onSubmit={handleReassignSubmit}>
                             <div className="p-4 border-b">
                                <h3 className="text-lg font-bold text-slate-800">Reasignar Mesero (Mesa {reassignModal.tableNumber})</h3>
                                <p className="text-sm text-slate-500">Mesero actual: {reassignModal.currentWaiter}</p>
                            </div>
                            <div className="p-6">
                                <label htmlFor="new-waiter" className="block text-sm font-medium text-slate-700 mb-2">Nuevo Mesero:</label>
                                <select 
                                    id="new-waiter"
                                    value={newWaiterId}
                                    onChange={(e) => setNewWaiterId(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="" disabled>Selecciona un mesero</option>
                                    {waiters.map(waiter => (
                                        <option key={waiter} value={waiter}>{waiter}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-b-xl flex justify-end space-x-3">
                                <button type="button" onClick={() => setReassignModal({ ...reassignModal, open: false })} className="py-2 px-4 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition">Cancelar</button>
                                <button type="submit" className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default CashierView;
