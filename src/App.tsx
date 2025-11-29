import React, { useState, useEffect, useCallback } from 'react';
import { Role, type MenuItem, type SessionInfo, type Order, OrderStatus, type CartItem, type WaiterCall } from './types';
import { fetchMenuData } from './services/menuService';
import RoleSelectionScreen from './components/RoleSelectionScreen';
import CheckInScreen from './components/CheckInScreen';
import ClientView from './components/ClientView';
import WaiterView from './components/WaiterView';
import CashierView from './components/CashierView';
import Spinner from './components/Spinner';
import ErrorDisplay from './components/ErrorDisplay';
import useLocalStorage from './hooks/useLocalStorage';
import { INITIAL_WAITERS } from './constants';

const App: React.FC = () => {
    const [currentRole, setCurrentRole] = useState<Role | null>(null);
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
    const [menuData, setMenuData] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [orders, setOrders] = useLocalStorage<Order[]>('restaurantOrders', []);
    const [waiters, setWaiters] = useLocalStorage<string[]>('restaurantWaiters', INITIAL_WAITERS);
    const [waiterCalls, setWaiterCalls] = useLocalStorage<WaiterCall[]>('restaurantWaiterCalls', []);

    const loadMenu = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { menu, categories } = await fetchMenuData();
            setMenuData(menu);
            setCategories(categories);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    useEffect(() => {
        loadMenu();
    }, [loadMenu]);

    const handleRoleSelect = (role: Role) => {
        setCurrentRole(role);
    };

    const handleCheckInSubmit = (info: SessionInfo) => {
        setSessionInfo(info);
    };
    
    const handleReset = () => {
        setCurrentRole(null);
        setSessionInfo(null);
    };

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
        // FIX: Update order status to PAID instead of filtering them out.
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

    const handleUpdateSession = (newInfo: Partial<SessionInfo>) => {
        setSessionInfo(prev => prev ? { ...prev, ...newInfo } : null);
    };
    
    const handleReassignTable = (tableNumber: string, newWaiterId: string) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.tableNumber === tableNumber
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

    const renderContent = () => {
        if (isLoading && menuData.length === 0) {
            return (
                 <div className="flex-grow flex items-center justify-center">
                    <div className="text-center p-8">
                        <Spinner />
                        <h2 className="text-2xl font-semibold text-indigo-600 mt-4">Cargando Menú...</h2>
                        <p className="text-slate-500">Obteniendo datos de Google Sheets.</p>
                    </div>
                </div>
            );
        }
        
        if (error) {
            return <ErrorDisplay message={error} onRetry={loadMenu} onReset={handleReset}/>;
        }

        if (!currentRole) {
            return <RoleSelectionScreen onSelectRole={handleRoleSelect} />;
        }
        
        if (!sessionInfo) {
            return <CheckInScreen role={currentRole} onSubmit={handleCheckInSubmit} onBack={() => setCurrentRole(null)} />;
        }

        if (currentRole === Role.CLIENT) {
            return <ClientView 
                        menuData={menuData} 
                        categories={categories} 
                        sessionInfo={sessionInfo} 
                        onExit={handleReset} 
                        orders={orders.filter(o => o.tableNumber === sessionInfo.tableNumber)}
                        onPlaceOrder={handlePlaceOrder}
                        onUpdateSession={handleUpdateSession}
                        onRequestBill={handleRequestBill}
                        onCallWaiter={handleCallWaiter}
                    />;
        }

        if (currentRole === Role.WAITER) {
            return <WaiterView 
                        sessionInfo={sessionInfo} 
                        onExit={handleReset} 
                        orders={orders}
                        onApproveOrder={handleApproveOrder}
                        onMarkAsDelivered={handleMarkAsDelivered}
                        waiterCalls={waiterCalls}
                        onAcknowledgeCall={handleAcknowledgeCall}
                        onMarkTableAsPaid={handleMarkTableAsPaid}
                    />;
        }

        if (currentRole === Role.CASHIER) {
             return <CashierView 
                        sessionInfo={sessionInfo} 
                        onExit={handleReset} 
                        orders={orders}
                        onClearTable={handleClearTable}
                        onReassignTable={handleReassignTable}
                        waiters={waiters}
                        setWaiters={setWaiters}
                    />;
        }

        return <RoleSelectionScreen onSelectRole={handleRoleSelect} />;
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
           {renderContent()}
        </div>
    );
};

export default App;
