
import React from 'react';
import { type MenuItem } from '../types';
import { formatPrice, convertToVes } from '../utils/formatters';

interface MenuItemCardProps {
    item: MenuItem;
    onAddToCart: (item: MenuItem) => void;
    onUpdateQuantity: (itemId: string, change: number) => void;
    quantityInCart: number;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart, onUpdateQuantity, quantityInCart }) => {
    const priceVes = convertToVes(item.price);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = 'https://picsum.photos/300/150?random=' + item.id;
        e.currentTarget.onerror = null;
    };
    
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition duration-300 hover:shadow-xl hover:-translate-y-1">
            <img
                src={item.image_url || `https://picsum.photos/300/150?random=${item.id}`}
                alt={item.name}
                onError={handleImageError}
                className="w-full h-32 object-cover"
            />
            <div className="p-3 flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 min-h-[3em]">{item.description}</p>
                </div>
                <div className="flex flex-col items-start mt-2">
                    <span className="text-xl font-extrabold text-indigo-600">{formatPrice(item.price, 'USD')}</span>
                    <span className="text-xs text-gray-500">({formatPrice(priceVes, 'VES')})</span>
                    <div className="mt-2 w-full">
                        {quantityInCart === 0 ? (
                            <button
                                onClick={() => onAddToCart(item)}
                                className="w-full bg-indigo-500 text-white px-4 py-1.5 rounded-full text-base font-semibold hover:bg-indigo-600 transition duration-200 shadow-md"
                            >
                                Añadir
                            </button>
                        ) : (
                            <div className="flex items-center justify-center space-x-3">
                                <button onClick={() => onUpdateQuantity(item.id, -1)} className="text-red-500 rounded-full w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 text-lg font-bold">-</button>
                                <span className="text-lg font-bold w-8 text-center text-gray-800">{quantityInCart}</span>
                                <button onClick={() => onUpdateQuantity(item.id, 1)} className="text-green-500 rounded-full w-8 h-8 flex items-center justify-center bg-green-100 hover:bg-green-200 text-lg font-bold">+</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuItemCard;