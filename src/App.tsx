import React, { useState, useEffect, useCallback } from 'react';
import { Role, type MenuItem, type SessionInfo } from './types';
import { fetchMenuData } from './services/menuService';
import RoleSelectionScreen from './components/RoleSelectionScreen';
import CheckInScreen from './components/CheckInScreen';
import ClientView from './components/ClientView';
import WaiterView from './components/WaiterView';
import CashierView from './components/CashierView';
import Spinner from './components/Spinner';
import ErrorDisplay from './components/ErrorDisplay';
import { DataProvider } from './context/DataContext';

const AppContent: React.FC = () => {
    const [currentRole, setCurrentRole] = useState<Role | null>(null);
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
    const [menuData, setMenuData] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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
    
    const handleUpdateSession = (newInfo: Partial<SessionInfo>) => {
        setSessionInfo(prev => prev ? { ...prev, ...newInfo } : null);
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
                        onUpdateSession={handleUpdateSession}
                    />;
        }

        if (currentRole === Role.WAITER) {
            return <WaiterView 
                        sessionInfo={sessionInfo} 
                        onExit={handleReset} 
                    />;
        }

        if (currentRole === Role.CASHIER) {
             return <CashierView 
                        sessionInfo={sessionInfo} 
                        onExit={handleReset} 
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

const App: React.FC = () => (
    <DataProvider>
        <AppContent />
    </DataProvider>
);

export default App;