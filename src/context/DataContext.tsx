import React, { createContext, useContext, ReactNode } from 'react';
import { type Order, type WaiterCall, type CartItem, type SessionInfo, OrderStatus } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { INITIAL_WAITERS } from '../constants';

interface DataContextType {
    orders: Order[];
    waiters: string[];
    setWaiters: React.Dispatch<React.SetStateAction<string[]>>;
    waiterCalls: WaiterCall[];
    handlePlaceOrder: (cart: CartItem[], sessionInfo: SessionInfo) => void;
    handleApproveOrder: (orderId: string) => void;
    handleMarkAsDelivered: (orderId: string) => void;
    handleRequestBill: (tableNumber: string, paymentMethod: string) => void;
    handleMarkTableAsPaid: (tableNumber: string) => void;
    handleClearTable: (tableNumber: string) => void;
    handleReassignTable: (tableNumber: string, newWaiterId: string) => void;
    handleCallWaiter: (tableNumber: string, waiterId: string) => void;
    handleAcknowledgeCall: (tableNumber: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [orders, setOrders] = useLocalStorage<Order[]>('restaurantOrders', []);
    const [waiters, setWaiters] = useLocalStorage<string[]>('restaurantWaiters', INITIAL_WAITERS);
    const [waiterCalls, setWaiterCalls] = useLocalStorage<WaiterCall[]>('restaurantWaiterCalls', []);

    const handlePlaceOrder = (cart: CartItem[], sessionInfo: SessionInfo) => {
        const newOrder: Order = {
            id: crypto.randomUUID(),
            tableNumber: sessionInfo.tableNumber!,
            waiterId: sessionInfo.waiterId,
            clientName: sessionInfo.clientName,
            items: cart,
            total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            status: OrderStatus.PENDING,
            timestamp: Date.now(),
        };
        setOrders(prevOrders => [...prevOrders, newOrder]);
    };

    const handleApproveOrder = (orderId: string) => {
        setOrders(prevOrders => 
            prevOrders.map(order => 
                order.id === orderId ? { ...order, status: OrderStatus.APPROVED } : order
            )
        );
    };
    
    const handleMarkAsDelivered = (orderId: string) => {
         setOrders(prevOrders => 
            prevOrders.map(order => 
                order.id === orderId ? { ...order, status: OrderStatus.DELIVERED } : order
            )
        );
    };
    
    const handleRequestBill = (tableNumber: string, paymentMethod: string) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                (order.tableNumber === tableNumber && (order.status === OrderStatus.APPROVED || order.status === OrderStatus.DELIVERED))
                ? { ...order, status: OrderStatus.BILL_REQUESTED, paymentMethod }
                : order
            )
        );
    };
    
    const handleMarkTableAsPaid = (tableNumber: string) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                (order.tableNumber === tableNumber && order.status !== OrderStatus.PENDING)
                ? { ...order, status: OrderStatus.PAID }
                : order
            )
        );
    };
    
    const handleClearTable = (tableNumber: string) => {
        setOrders(prevOrders => prevOrders.filter(order => order.tableNumber !== tableNumber));
    };

    const handleReassignTable = (tableNumber: string, newWaiterId: string) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.tableNumber === tableNumber && order.status !== OrderStatus.PAID
                 ? { ...order, waiterId: newWaiterId } 
                 : order
            )
        );
    };
    
    const handleCallWaiter = (tableNumber: string, waiterId: string) => {
        setWaiterCalls(prevCalls => {
            if (prevCalls.some(call => call.tableNumber === tableNumber)) {
                return prevCalls;
            }
            return [...prevCalls, { tableNumber, waiterId, timestamp: Date.now() }];
        });
    };

    const handleAcknowledgeCall = (tableNumber: string) => {
        setWaiterCalls(prevCalls => prevCalls.filter(call => call.tableNumber !== tableNumber));
    };

    const value = {
        orders,
        waiters,
        setWaiters,
        waiterCalls,
        handlePlaceOrder,
        handleApproveOrder,
        handleMarkAsDelivered,
        handleRequestBill,
        handleMarkTableAsPaid,
        handleClearTable,
        handleReassignTable,
        handleCallWaiter,
        handleAcknowledgeCall,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
