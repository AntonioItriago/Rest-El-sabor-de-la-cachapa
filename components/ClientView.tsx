
import React, { useState } from 'react';
import { type MenuItem, type CartItem, type SessionInfo, type ModalContent, type Order, OrderStatus } from '../types';
import Header from './Header';
import MenuItemCard from './MenuItemCard';
import Modal from './Modal';
import ClientOrderStatus from './ClientOrderStatus';
import { formatPrice, convertToVes } from '../utils/formatters';

interface ClientViewProps {
    menuData: MenuItem[];
    categories: string[];
    sessionInfo: SessionInfo;
    onExit: () => void;
    orders: Order[];
    onPlaceOrder: (cart: CartItem[], sessionInfo: SessionInfo) => void;
    onUpdateSession: (newInfo: Partial<SessionInfo>) => void;
    onRequestBill: (tableNumber: string, paymentMethod: string) => void;
    onCallWaiter: (tableNumber: string, waiterId: string) => void;
}

const ClientView: React.FC<ClientViewProps> = ({ menuData, categories, sessionInfo, onExit, orders, onPlaceOrder, onUpdateSession, onRequestBill, onCallWaiter }) => {
    const [currentCategory, setCurrentCategory] = useState('all');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [modalContent, setModalContent] = useState<ModalContent | null>(null);
    const [isBillingActive, setIsBillingActive] = useState(false);
    const [paymentMethodSent, setPaymentMethodSent] = useState(false);

    const cartTotalUsd = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartTotalVes = convertToVes(cartTotalUsd);
    
    const approvedTotal = orders
        .filter(o => o.status !== OrderStatus.PENDING && o.status !== OrderStatus.PAID)
        .reduce((sum, order) => sum + order.total, 0);

    const hasPendingOrders = orders.some(o => o.status === OrderStatus.PENDING);
    const hasBillableOrders = orders.some(o => [OrderStatus.APPROVED, OrderStatus.DELIVERED, OrderStatus.BILL_REQUESTED].includes(o.status));
    const canRequestBill = hasBillableOrders && !hasPendingOrders;

    const handleAddToCart = (item: MenuItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
    };

    const handleUpdateQuantity = (itemId: string, change: number) => {
        setCart(prevCart => {
            const item = prevCart.find(cartItem => cartItem.id === itemId);
            if (!item) return prevCart;

            const newQuantity = item.quantity + change;
            if (newQuantity <= 0) {
                return prevCart.filter(cartItem => cartItem.id !== itemId);
            }
            return prevCart.map(cartItem =>
                cartItem.id === itemId ? { ...cartItem, quantity: newQuantity } : cartItem
            );
        });
    };
    
    const showModal = (title: string, message: string, type: ModalContent['type']) => {
        setModalContent({ title, message, type });
    };
    
    const handleCallWaiterClick = () => {
         onCallWaiter(sessionInfo.tableNumber!, sessionInfo.waiterId);
         showModal('🔔 Llamada Enviada', `El Mesonero **${sessionInfo.waiterId}** ha sido notificado para que atienda la **Mesa ${sessionInfo.tableNumber}**.`, 'info');
    }
    
    const handleSendOrder = () => {
        if(cart.length === 0){
             showModal('⚠️ Carrito Vacío', 'Por favor, añade al menos un producto al carrito antes de enviar el pedido.', 'error');
             return;
        }
        onPlaceOrder(cart, { ...sessionInfo, clientName: sessionInfo.clientName || 'Anónimo' });
        setCart([]); // Limpiar el carrito
        showModal('✅ Pedido Enviado', `Su pedido ha sido enviado al Mesonero **${sessionInfo.waiterId}** y está **pendiente de aprobación**.`, 'success');
    }
    
    const handleRequestBillClick = () => {
        if (hasPendingOrders) {
            showModal('⚠️ Pedidos Pendientes', 'Aún tiene pedidos pendientes de aprobación. Por favor, espere antes de solicitar la cuenta.', 'error');
            return;
        }
        if (!hasBillableOrders) {
            showModal('⚠️ Sin Consumo', 'No hay órdenes aprobadas para solicitar la cuenta.', 'error');
            return;
        }
        setIsBillingActive(true);
    };

    const handlePaymentSelection = (method: string) => {
        onRequestBill(sessionInfo.tableNumber!, method);
        setPaymentMethodSent(true);
        showModal('✅ Notificación Enviada', `El mesonero **${sessionInfo.waiterId}** ha sido notificado. Vendrá en breve para procesar su pago con **${method}**.`, 'success');
    };
    
    const handleEditClientName = () => {
        const newName = prompt("Por favor, introduce tu nombre:", sessionInfo.clientName || "");
        if (newName !== null) { // prompt returns null if user clicks cancel
            const trimmedName = newName.trim();
            onUpdateSession({ clientName: trimmedName ? trimmedName : undefined });
        }
    };


    const filteredMenu = currentCategory === 'all'
        ? menuData
        : menuData.filter(item => item.category === currentCategory);

    if (isBillingActive) {
        return (
            <>
                <Header title="Resumen de Cuenta" sessionInfo={sessionInfo} onExit={onExit} />
                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl text-center animate-fade-in">
                        {paymentMethodSent ? (
                            <>
                                <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Gracias!</h2>
                                 <svg className="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 a 9 9 0 0118 0z"></path></svg>
                                <p className="text-gray-600 leading-relaxed">
                                    El mesonero **{sessionInfo.waiterId}** ha sido notificado y se dirige a su mesa para procesar el pago.
                                </p>
                                <p className="text-sm text-gray-500 mt-6">Puede cerrar esta ventana o esperar. ¡Agradecemos su visita!</p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">Total a Pagar</h2>
                                <p className="text-4xl font-extrabold text-indigo-600 mb-4">{formatPrice(approvedTotal, 'USD')}</p>
                                <p className="text-lg text-gray-500 mb-8">({formatPrice(convertToVes(approvedTotal), 'VES')})</p>
                                
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Seleccione su forma de pago</h3>
                                <div className="space-y-3">
                                    <button onClick={() => handlePaymentSelection('Efectivo')} className="w-full py-3 text-lg bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition shadow-md">Efectivo</button>
                                    <button onClick={() => handlePaymentSelection('Tarjeta')} className="w-full py-3 text-lg bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition shadow-md">Tarjeta</button>
                                    <button onClick={() => handlePaymentSelection('Pago Móvil')} className="w-full py-3 text-lg bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition shadow-md">Pago Móvil / Zelle</button>
                                </div>
                                <p className="text-sm text-gray-500 mt-8">Al seleccionar una opción, se notificará al mesonero.</p>
                            </>
                        )}
                    </div>
                </div>
                 {modalContent && <Modal isOpen={!!modalContent} onClose={() => setModalContent(null)} title={modalContent.title} message={modalContent.message} type={modalContent.type} />}
            </>
        );
    }

    return (
        <>
            <Header title="El Sabor de la Cachapa" sessionInfo={sessionInfo} onExit={onExit} onEditClientName={handleEditClientName} />
            <div className="flex-grow flex flex-col lg:flex-row max-w-7xl mx-auto p-4 gap-6 w-full">
                <main className="w-full lg:w-3/4">
                    <div className="mb-6">
                         <button onClick={handleCallWaiterClick} className="w-full py-3 bg-red-600 text-white text-lg font-bold rounded-xl hover:bg-red-700 transition shadow-lg flex items-center justify-center space-x-2 transform active:scale-[0.99]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.41 6.845 6 9.387 6 12v2.158c0 .248-.052.492-.158.72l-1.405 1.405h5M15 17v1a3 3 0 11-6 0v-1M12 21a2 2 0 01-2-2h4a2 2 0 01-2 2z"></path></svg>
                            <span>¡Llamar al Mesonero!</span>
                        </button>
                    </div>
                    
                    <div className="mb-6 flex flex-wrap gap-2">
                         <button onClick={() => setCurrentCategory('all')} className={`px-4 py-2 rounded-full text-sm font-medium transition ${currentCategory === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>
                            Todas
                        </button>
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setCurrentCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${currentCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        {currentCategory === 'all' ? 'Todos los Productos' : currentCategory}
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredMenu.map(item => {
                             const cartItem = cart.find(ci => ci.id === item.id);
                             return (
                                <MenuItemCard 
                                    key={item.id} 
                                    item={item} 
                                    onAddToCart={handleAddToCart}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    quantityInCart={cartItem?.quantity || 0}
                                />
                            );
                        })}
                    </div>
                     {filteredMenu.length === 0 && currentCategory !== 'all' && (
                        <p className="text-center p-8 text-lg text-gray-500">
                            No hay productos en la categoría '{currentCategory}'.
                        </p>
                    )}
                </main>
                
                <aside className="w-full lg:w-1/4">
                    <div className="sticky top-24 bg-white p-6 rounded-xl shadow-2xl">
                        {/* Cart Section */}
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Mi Pedido</h2>
                        <div className="max-h-80 overflow-y-auto pr-2 mb-4">
                            {cart.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    <p>Añade productos a tu pedido.</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex justify-between items-center border-b pb-2 mb-2">
                                        <div className="flex-grow pr-2">
                                            <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                                            <div className="flex items-center mt-1">
                                                <button onClick={() => handleUpdateQuantity(item.id, -1)} className="text-red-500 rounded-full w-5 h-5 flex items-center justify-center bg-red-100 hover:bg-red-200">-</button>
                                                <span className="mx-2 text-sm font-bold">{item.quantity}</span>
                                                <button onClick={() => handleUpdateQuantity(item.id, 1)} className="text-green-500 rounded-full w-5 h-5 flex items-center justify-center bg-green-100 hover:bg-green-200">+</button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="font-bold text-sm text-indigo-600">{formatPrice(item.price * item.quantity, 'USD')}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Total del Pedido</h3>
                            <div className="flex flex-col justify-between items-start text-xl font-extrabold text-gray-800 mb-4">
                                <span className="text-sm font-normal text-gray-500">USD:</span>
                                <span>{formatPrice(cartTotalUsd, 'USD')}</span>
                                <span className="text-sm font-normal text-gray-500 mt-2">VES (Est.):</span>
                                <span className="text-lg text-green-600">{formatPrice(cartTotalVes, 'VES')}</span>
                            </div>
                            <button onClick={handleSendOrder} disabled={cart.length === 0} className="w-full py-3 bg-indigo-500 text-white font-bold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600 shadow-xl mb-3 transform active:scale-[0.99]">
                                Enviar Pedido
                            </button>
                        </div>
                        
                        {/* Order Status Section */}
                        <ClientOrderStatus
                            orders={orders}
                            onRequestBill={handleRequestBillClick}
                            canRequestBill={canRequestBill}
                        />
                    </div>
                </aside>
            </div>
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

export default ClientView;
