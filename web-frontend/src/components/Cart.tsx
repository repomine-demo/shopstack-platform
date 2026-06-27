import React from "react";
import { Product } from "../hooks/useProducts";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface Props {
  items: CartItem[];
  onUpdateQty: (productId: number, delta: number) => void;
  onRemove: (productId: number) => void;
  onCheckout: () => void;
}

export function Cart({ items, onUpdateQty, onRemove, onCheckout }: Props) {
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  if (items.length === 0) {
    return <div className="cart-empty"><p>Your cart is empty</p></div>;
  }

  return (
    <div className="cart">
      {items.map(item => (
        <div key={item.product.id} className="cart-item">
          <span>{item.product.name}</span>
          <div className="qty-controls">
            <button onClick={() => onUpdateQty(item.product.id, -1)}>−</button>
            <span>{item.quantity}</span>
            <button onClick={() => onUpdateQty(item.product.id, 1)}>+</button>
          </div>
          <span>${(item.product.price * item.quantity).toFixed(2)}</span>
          <button onClick={() => onRemove(item.product.id)}>Remove</button>
        </div>
      ))}
      <div className="cart-total">
        <strong>Total: ${total.toFixed(2)}</strong>
        <button onClick={onCheckout}>Checkout</button>
      </div>
    </div>
  );
}
