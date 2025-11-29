
import React, { useState, useMemo } from 'react';
import { type SessionInfo, type Order, OrderStatus, type ModalContent, type WaiterCall } from '../types';
import Header from './Header';
import OrderCard from './OrderCard';
import Modal from './Modal';

interface WaiterViewProps {
    sessionInfo: SessionInfo;
    onExit: () => void;
    orders: Order[];
    onApproveOrder: (orderId: string) => void;
    onMarkAsDelivered: (orderId: string) => void;
    waiterCalls: WaiterCall[];
    onAcknowledgeCall: (tableNumber: string) => void;
    onMarkTableAsPaid: (tableNumber: string) => void;
}

const WaiterView: React.FC<WaiterViewProps> = ({ sessionInfo, onExit, orders, onApproveOrder, onMarkAsDelivered, waiterCalls, onAcknowledgeCall, onMarkTableAsPaid }) => {
    const [modalContent, setModalContent] = useState<ModalContent | null>(null);

    const { waiterId: currentWaiterId, tableNumber } = sessionInfo;

    const ordersForView = useMemo(() => {
        if (tableNumber) {
            return orders.filter(o => o.tableNumber === tableNumber);
        }
        return orders;
    }, [orders, tableNumber]);
    
    const callsForThisWaiter = useMemo(() => {
        const calls = waiterCalls.filter(call => call.waiterId === currentWaiterId);
        if (tableNumber) {
            return calls.filter(call => call.tableNumber === tableNumber);
        }
        return calls;
    }, [waiterCalls, currentWaiterId, tableNumber]);
    
    const billRequestTables = useMemo(() => {
        const tables: { [key: string]: { orders: Order[], paymentMethod?: string, clientName?: string } } = {};
        ordersForView
            .filter(o => o.status === OrderStatus.BILL_REQUESTED)
            .forEach(order => {
                if (!tables[order.tableNumber]) {
                    tables[order.tableNumber] = { 
                        orders: [], 
                        paymentMethod: order.paymentMethod,
                        clientName: order.clientName,
                    };
                }
                tables[order.tableNumber].orders.push(order);
            });
        return tables;
    }, [ordersForView]);

    const pendingOrders = ordersForView.filter(o => o.status === OrderStatus.PENDING).sort((a, b) => a.timestamp - b.timestamp);
    const activeOrders = ordersForView.filter(o => o.status !== OrderStatus.PENDING && o.status !== OrderStatus.BILL_REQUESTED).sort((a, b) => b.timestamp - a.timestamp);

    const handleApprove = (orderId: string) => {
        onApproveOrder(orderId);
        setModalContent({
            title: '✅ Pedido Aprobado',
            message: `El pedido **#${orderId.substring(0, 6)}** ha sido aprobado y enviado a cocina.`,
            type: 'success'
        });
    };
    
    const handleDeliver = (orderId: string) => {
        onMarkAsDelivered(orderId);
        setModalContent({
            title: '✅ Pedido Entregado',
            message: `El pedido **#${orderId.substring(0, 6)}** ha sido marcado como entregado en la mesa.`,
            type: 'info'
        });
    }
    
     const handleConfirmPayment = (tableNumber: string) => {
        onMarkTableAsPaid(tableNumber);
        setModalContent({
            title: '✅ Cobro Confirmado',
            message: `La mesa **#${tableNumber}** ha sido marcada como pagada.`,
            type: 'success'
        });
    };

    const getStatusChipColor = (status: OrderStatus) => {
        const colors: Record<OrderStatus, string> = {
            [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
            [OrderStatus.APPROVED]: 'bg-green-100 text-green-800',
            [OrderStatus.DELIVERED]: 'bg-blue-100 text-blue-800',
            [OrderStatus.BILL_REQUESTED]: 'bg-red-100 text-red-800',
            [OrderStatus.PAID]: 'bg-purple-100 text-purple-800',
        };
        return colors[status] || 'bg-slate-100 text-slate-800';
    };

    return (
        <>
            <Header title="Panel de Mesero" sessionInfo={sessionInfo} onExit={onExit} isWaiter={true} />
            <main className="max-w-7xl mx-auto p-4 w-full space-y-10">
                {callsForThisWaiter.length > 0 && (
                     <section>
                        <h2 className="text-2xl font-bold text-yellow-600 mb-4 border-b-2 border-yellow-200 pb-2">Llamadas de Mesa ({callsForThisWaiter.length})</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {callsForThisWaiter.map(call => (
                                <div key={call.tableNumber} className="bg-yellow-50 rounded-lg shadow-lg p-4 border-2 border-yellow-400 flex justify-between items-center animate-pulse-slow">
                                    <div className="flex items-center">
                                         <svg className="w-8 h-8 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15h14a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
                                        <span className="font-bold text-lg">Mesa {call.tableNumber} solicita atención</span>
                                    </div>
                                    <button onClick={() => onAcknowledgeCall(call.tableNumber)} className="py-1 px-3 bg-yellow-400 text-yellow-900 font-semibold rounded-lg hover:bg-yellow-500 transition">
                                        Atendido
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <h2 className="text-2xl font-bold text-red-600 mb-4 border-b-2 border-red-200 pb-2">Mesas Solicitando Cuenta ({Object.keys(billRequestTables).length})</h2>
                    {Object.keys(billRequestTables).length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-lg"><p className="text-slate-500">No hay mesas solicitando la cuenta.</p></div>
                    ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(billRequestTables).map(([tableNum, data]) => {
                                return (
                                     <div key={tableNum} className="bg-red-50 rounded-lg shadow-lg p-4 border-2 border-red-400 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-lg text-slate-900">Mesa {tableNum}</span>
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800">PAGO SOLICITADO</span>
                                            </div>
                                            {data.clientName && data.clientName !== 'Anónimo' && <p className="text-sm text-slate-700">Cliente: <span className="font-semibold">{data.clientName}</span></p>}
                                            <p className="text-sm font-semibold text-slate-700">Forma de Pago: <span className="font-bold text-red-700">{data.paymentMethod}</span></p>
                                        </div>
                                        <button 
                                            onClick={() => handleConfirmPayment(tableNum)}
                                            className="mt-4 w-full py-2 bg-purple-500 text-white font-bold rounded-lg transition shadow-md hover:bg-purple-600 active:scale-95"
                                        >
                                            Confirmar Cobro
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </section>
                
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">Pedidos Pendientes de Aprobación ({pendingOrders.length})</h2>
                    {pendingOrders.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-lg"><p className="text-slate-500">No hay pedidos pendientes.</p></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingOrders.map(order => (
                                <OrderCard 
                                    key={order.id} 
                                    order={order} 
                                    onApprove={handleApprove} 
                                    isAssignedWaiter={order.waiterId === currentWaiterId}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">Pedidos Activos e Historial ({activeOrders.length})</h2>
                    {activeOrders.length === 0 ? (
                         <div className="text-center py-8 bg-slate-50 rounded-lg"><p className="text-slate-500">No hay pedidos activos.</p></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeOrders.map(order => (
                                <div key={order.id} className="bg-white rounded-lg shadow p-4 border flex flex-col justify-between transition-shadow hover:shadow-md">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold">Mesa {order.tableNumber}</span>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusChipColor(order.status)}`}>{order.status}</span>
                                        </div>
                                        <p className="text-sm text-slate-600">Mesonero: <strong>{order.waiterId}</strong></p>
                                        
                                        <ul className="text-sm text-slate-600 list-disc list-inside my-2 pl-2">
                                            {order.items.map(item => (
                                                <li key={item.id}>
                                                    {item.name} <span className="font-semibold">x{item.quantity}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-xs text-slate-400 mt-2">{new Date(order.timestamp).toLocaleString()}</p>
                                    </div>
                                    {order.status === OrderStatus.APPROVED && (
                                        <button 
                                            onClick={() => handleDeliver(order.id)}
                                            disabled={order.waiterId !== currentWaiterId}
                                            className="mt-4 w-full py-2 bg-blue-500 text-white font-bold rounded-lg transition shadow-md active:scale-95 disabled:bg-slate-400 disabled:cursor-not-allowed"
                                            title={order.waiterId !== currentWaiterId ? `Este pedido está asignado a ${order.waiterId}` : 'Marcar como Entregado'}
                                        >
                                            Marcar como Entregado
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
            {modalContent && (
                <Modal
                    isOpen={!!modalContent}
                    onClose={() => setModalContent(null)}
                    title={modalContent.title}
                    message={modalContent.message}
                    type={modalContent.type}
                />
            )}
        </>
    );
};

export default WaiterView;
