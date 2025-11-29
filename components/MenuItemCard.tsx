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

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex items-center p-4 transition duration-300 hover:shadow-lg hover:border-indigo-300 border border-transparent">
            <div className="flex-grow">
                <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{item.description}</p>
            </div>
            <div className="flex flex-col items-end min-w-[120px] ml-4 text-right">
                <span className="text-xl font-extrabold text-indigo-600">{formatPrice(item.price, 'USD')}</span>
                <span className="text-sm text-slate-500">{formatPrice(priceVes, 'VES')}</span>
                <div className="mt-2 w-full">
                    {quantityInCart === 0 ? (
                        <button
                            onClick={() => onAddToCart(item)}
                            className="w-full bg-indigo-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-indigo-600 transition duration-200 shadow"
                        >
                            Añadir
                        </button>
                    ) : (
                        <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => onUpdateQuantity(item.id, -1)} className="text-red-500 rounded-full w-7 h-7 flex items-center justify-center bg-red-100 hover:bg-red-200 text-lg font-bold">-</button>
                            <span className="text-lg font-bold w-7 text-center text-slate-800">{quantityInCart}</span>
                            <button onClick={() => onUpdateQuantity(item.id, 1)} className="text-green-500 rounded-full w-7 h-7 flex items-center justify-center bg-green-100 hover:bg-green-200 text-lg font-bold">+</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuItemCard;
