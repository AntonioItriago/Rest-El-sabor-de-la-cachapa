
import React from 'react';
import { Order, OrderStatus } from '../types';
import { formatPrice } from '../utils/formatters';

interface OrderCardProps {
    order: Order;
    onApprove: (orderId: string) => void;
    isAssignedWaiter: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onApprove, isAssignedWaiter }) => {
    
    const isPending = order.status === OrderStatus.PENDING;

    const cardColor = isPending ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200';
    const headerColor = isPending ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800';

    return (
        <div className={`rounded-lg shadow-md border ${cardColor} transition-shadow hover:shadow-lg animate-fade-in`}>
            <div className={`p-3 rounded-t-lg font-bold flex justify-between items-center ${headerColor}`}>
                <span>Mesa {order.tableNumber} - Pedido #{order.id.substring(0, 6)}</span>
                <span className="text-sm">{new Date(order.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="p-4">
                {order.clientName && <p className="text-sm text-gray-600 mb-1">Cliente: <span className="font-semibold">{order.clientName}</span></p>}
                 <p className="text-sm text-gray-600 mb-2">Asignado a: <span className="font-semibold">{order.waiterId}</span></p>
                
                <ul className="space-y-1 mb-3">
                    {order.items.map(item => (
                        <li key={item.id} className="text-sm flex justify-between">
                            <span>{item.name} <span className="font-semibold text-gray-800">x{item.quantity}</span></span>
                            <span className="text-gray-600">{formatPrice(item.price * item.quantity, 'USD')}</span>
                        </li>
                    ))}
                </ul>

                {isPending && (
                    <div className="mt-4">
                        <button 
                            onClick={() => onApprove(order.id)}
                            disabled={!isAssignedWaiter}
                            className="w-full py-2 bg-green-500 text-white font-bold rounded-lg transition shadow-md active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            title={!isAssignedWaiter ? `Este pedido está asignado a ${order.waiterId}` : 'Aprobar Pedido'}
                        >
                            Aprobar y Enviar a Cocina
                        </button>
                        {!isAssignedWaiter && <p className="text-xs text-center mt-2 text-gray-500">Solo el mesonero asignado puede aprobar.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderCard;
