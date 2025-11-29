
import React, { useEffect } from 'react';
import { type ModalType } from '../types';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: ModalType;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, message, type = 'info' }) => {
    useEffect(() => {
        if (isOpen && type !== 'error') {
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, type, onClose]);

    if (!isOpen) {
        return null;
    }

    const headerClasses: { [key in ModalType]: string } = {
        info: 'bg-indigo-600',
        success: 'bg-green-600',
        error: 'bg-red-600',
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100">
                <div className={`p-4 text-white text-lg font-bold rounded-t-xl ${headerClasses[type]}`}>{title}</div>
                <div className="p-6">
                    <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                    <button
                        onClick={onClose}
                        className="mt-4 w-full py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition"
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
