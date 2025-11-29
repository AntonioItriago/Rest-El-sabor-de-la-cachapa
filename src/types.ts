export enum Role {
  CLIENT = 'client',
  WAITER = 'waiter',
  CASHIER = 'cashier',
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface SessionInfo {
  waiterId: string; // Used for Waiter ID and Cashier Name
  tableNumber?: string; // Optional for Cashier
  clientName?: string;
}

export type ModalType = 'info' | 'success' | 'error';

export interface ModalContent {
    title: string;
    message: string;
    type: ModalType;
}

export enum OrderStatus {
    PENDING = 'Pendiente de Aprobación',
    APPROVED = 'Aprobado - En Cocina',
    DELIVERED = 'Entregado',
    BILL_REQUESTED = 'Solicitando Cuenta',
    PAID = 'Pagado',
}

export interface Order {
    id: string;
    tableNumber: string;
    waiterId: string;
    clientName?: string;
    items: CartItem[];
    total: number;
    status: OrderStatus;
    timestamp: number;
    paymentMethod?: string;
}

export interface WaiterCall {
  tableNumber: string;
  waiterId: string;
  timestamp: number;
}
