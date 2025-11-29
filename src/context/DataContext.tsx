import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { type Order, type WaiterCall, type CartItem, type SessionInfo, OrderStatus } from '../types';
import { INITIAL_WAITERS, INITIAL_TABLE_WAITER_ASSIGNMENTS } from '../constants';
import { db } from '../firebase';
import { ref, onValue, set, push, update, remove } from 'firebase/database';

interface DataContextType {
    orders: Order[];
    waiters: string[];
    waiterCalls: WaiterCall[];
    tableAssignments: { [key: string]: string | null };
    handlePlaceOrder: (cart: CartItem[], sessionInfo: SessionInfo) => void;
    handleApproveOrder: (orderId: string) => void;
    handleMarkAsDelivered: (orderId: string) => void;
    handleRequestBill: (tableNumber: string, paymentMethod: string) => void;
    handleMarkTableAsPaid: (tableNumber: string) => void;
    handleClearTable: (tableNumber: string) => void;
    handleReassignTable: (tableNumber: string, newWaiterId: string) => void;
    handleCallWaiter: (tableNumber: string, waiterId: string) => void;
    handleAcknowledgeCall: (tableNumber: string) => void;
    handleAddWaiter: (waiterToAdd: string) => void;
    handleDeleteWaiter: (waiterToDelete: string) => void;
    handleAssignTables: (waiterId: string, tableNumbers: string[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [waiters, setWaiters] = useState<string[]>([]);
    const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);
    const [tableAssignments, setTableAssignments] = useState<{ [key: string]: string | null }>({});

    useEffect(() => {
        const ordersRef = ref(db, 'orders');
        const unsubscribe = onValue(ordersRef, (snapshot) => {
            const data = snapshot.val();
            const loadedOrders: Order[] = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            setOrders(loadedOrders);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const waitersRef = ref(db, 'waiters');
        const unsubscribe = onValue(waitersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setWaiters(data);
            } else {
                set(waitersRef, INITIAL_WAITERS);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const callsRef = ref(db, 'waiterCalls');
        const unsubscribe = onValue(callsRef, (snapshot) => {
            const data = snapshot.val();
            const loadedCalls: WaiterCall[] = data ? Object.keys(data).map(key => ({ tableNumber: key, ...data[key] })) : [];
            setWaiterCalls(loadedCalls);
        });
        return () => unsubscribe();
    }, []);
    
    useEffect(() => {
        const assignmentsRef = ref(db, 'tableAssignments');
        const unsubscribe = onValue(assignmentsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setTableAssignments(data);
            } else {
                set(assignmentsRef, INITIAL_TABLE_WAITER_ASSIGNMENTS);
            }
        });
        return () => unsubscribe();
    }, []);

    const handlePlaceOrder = (cart: CartItem[], sessionInfo: SessionInfo) => {
        const newOrderData = {
            tableNumber: sessionInfo.tableNumber!,
            waiterId: sessionInfo.waiterId,
            clientName: sessionInfo.clientName,
            items: cart,
            total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            status: OrderStatus.PENDING,
            timestamp: Date.now(),
        };
        const newOrderRef = push(ref(db, 'orders'));
        set(newOrderRef, newOrderData);
    };

    const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
        const orderRef = ref(db, `orders/${orderId}`);
        update(orderRef, { status });
    };

    const handleApproveOrder = (orderId: string) => handleUpdateOrderStatus(orderId, OrderStatus.APPROVED);
    const handleMarkAsDelivered = (orderId: string) => handleUpdateOrderStatus(orderId, OrderStatus.DELIVERED);

    const handleRequestBill = (tableNumber: string, paymentMethod: string) => {
        const updates: { [key: string]: any } = {};
        orders.forEach(order => {
            if (order.tableNumber === tableNumber && (order.status === OrderStatus.APPROVED || order.status === OrderStatus.DELIVERED)) {
                updates[`/orders/${order.id}/status`] = OrderStatus.BILL_REQUESTED;
                updates[`/orders/${order.id}/paymentMethod`] = paymentMethod;
            }
        });
        update(ref(db), updates);
    };
    
    const handleMarkTableAsPaid = (tableNumber: string) => {
        const updates: { [key: string]: any } = {};
        orders.forEach(order => {
            if (order.tableNumber === tableNumber && order.status !== OrderStatus.PENDING) {
                updates[`/orders/${order.id}/status`] = OrderStatus.PAID;
            }
        });
        update(ref(db), updates);
    };
    
    const handleClearTable = (tableNumber: string) => {
        const updates: { [key: string]: null } = {};
        orders.forEach(order => {
            if (order.tableNumber === tableNumber) {
                updates[`/orders/${order.id}`] = null;
            }
        });
        update(ref(db), updates);
    };

    const handleReassignTable = (tableNumber: string, newWaiterId: string) => {
        const updates: { [key: string]: any } = {};
        // Update table assignment
        updates[`/tableAssignments/${tableNumber}`] = newWaiterId;

        // Update waiterId on existing, non-paid orders for that table
        orders.forEach(order => {
            if (order.tableNumber === tableNumber && order.status !== OrderStatus.PAID) {
                 updates[`/orders/${order.id}/waiterId`] = newWaiterId;
            }
        });
         update(ref(db), updates);
    };
    
    const handleCallWaiter = (tableNumber: string, waiterId: string) => {
        const callRef = ref(db, `waiterCalls/${tableNumber}`);
        set(callRef, { waiterId, timestamp: Date.now() });
    };

    const handleAcknowledgeCall = (tableNumber: string) => {
        const callRef = ref(db, `waiterCalls/${tableNumber}`);
        remove(callRef);
    };

    const handleAddWaiter = (waiterToAdd: string) => {
        const newWaiters = [...waiters, waiterToAdd].sort();
        set(ref(db, 'waiters'), newWaiters);
    };

    const handleDeleteWaiter = (waiterToDelete: string) => {
        if (waiters.includes(waiterToDelete)) {
            const newWaiters = waiters.filter(w => w !== waiterToDelete);
            set(ref(db, 'waiters'), newWaiters);
        }
        // Unassign all tables from this waiter
        const updates: { [key: string]: null } = {};
        Object.entries(tableAssignments).forEach(([table, waiter]) => {
            if (waiter === waiterToDelete) {
                updates[`/tableAssignments/${table}`] = null;
            }
        });
        if (Object.keys(updates).length > 0) {
            update(ref(db), updates);
        }
    };

    const handleAssignTables = (waiterId: string, tableNumbers: string[]) => {
        const updates: { [key: string]: string } = {};
        tableNumbers.forEach(table => {
            updates[`/tableAssignments/${table}`] = waiterId;
        });
        update(ref(db), updates);
    };


    const value = {
        orders,
        waiters,
        waiterCalls,
        tableAssignments,
        handlePlaceOrder,
        handleApproveOrder,
        handleMarkAsDelivered,
        handleRequestBill,
        handleMarkTableAsPaid,
        handleClearTable,
        handleReassignTable,
        handleCallWaiter,
        handleAcknowledgeCall,
        handleAddWaiter,
        handleDeleteWaiter,
        handleAssignTables
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
