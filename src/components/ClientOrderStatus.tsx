import React from 'react';
import { type Order, OrderStatus } from '../types';
import { formatPrice } from '../utils/formatters';

interface ClientOrderStatusProps {
    orders: Order[];
    onRequestBill: () => void;
    canRequestBill: boolean;
}

const ClientOrderStatus: React.FC<ClientOrderStatusProps> = ({ orders, onRequestBill, canRequestBill }) => {
    if (orders.length === 0) {
        return null;
    }
    
    const approvedTotal = orders
        // FIX: Exclude PAID orders from the billable total.
        .filter(o => o.status !== OrderStatus.PENDING && o.status !== OrderStatus.PAID)
        .reduce((sum, order) => sum + order.total, 0);

    const getStatusChipColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING:
                return 'bg-yellow-200 text-yellow-800';
            case OrderStatus.APPROVED:
                return 'bg-green-200 text-green-800';
            case OrderStatus.DELIVERED:
                return 'bg-blue-200 text-blue-800';
            case OrderStatus.BILL_REQUESTED:
                return 'bg-red-200 text-red-800';
            // FIX: Add styling for the PAID status.
            case OrderStatus.PAID:
                return 'bg-purple-200 text-purple-800';
            default:
                return 'bg-gray-200 text-gray-800';
        }
    };
    
    return (
        <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 border-t pt-4 mb-3">Mis Consumos</h3>
            <div className="max-h-60 overflow-y-auto pr-2 space-y-4">
                {orders.map(order => (
                    <div key={order.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm text-gray-700">Pedido #{order.id.substring(0, 6)}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusChipColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <ul className="text-xs text-gray-600 space-y-1">
                            {order.items.map(item => (
                                <li key={item.id} className="flex justify-between">
                                    <span>{item.name} <span className="font-semibold">x{item.quantity}</span></span>
                                    <span>{formatPrice(item.price * item.quantity, 'USD')}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="text-right font-bold text-sm mt-2 pt-2 border-t">{formatPrice(order.total, 'USD')}</div>
                    </div>
                ))}
            </div>
            {approvedTotal > 0 && (
                <div className="mt-4 pt-4 border-t-2 border-dashed">
                    <div className="flex justify-between items-center">
                        <span className="text-md font-bold text-gray-800">Total Aprobado a Pagar:</span>
                        <span className="text-lg font-extrabold text-indigo-600">{formatPrice(approvedTotal, 'USD')}</span>
                    </div>
                    <button 
                        onClick={onRequestBill} 
                        disabled={!canRequestBill}
                        className="mt-4 w-full py-3 bg-gray-200 text-gray-700 font-bold rounded-lg transition duration-200 hover:bg-gray-300 shadow-lg transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!canRequestBill ? 'Debe esperar que todos sus pedidos sean aprobados para poder pedir la cuenta' : 'Pedir la cuenta'}
                    >
                        Pedir la Cuenta
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClientOrderStatus;
