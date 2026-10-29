import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'hb_cart';
const CartContext = createContext(null);

/** Device-side cart. The server re-checks prices and stock at checkout. */
export function CartProvider({ children }) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        AsyncStorage.getItem(KEY)
            .then((raw) => raw && setItems(JSON.parse(raw)))
            .catch(() => {});
    }, []);

    const persist = (next) => {
        setItems(next);
        AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
    };

    const value = useMemo(() => {
        const add = (product, quantity = 1) => {
            const existing = items.find((i) => i.product.id === product.id);
            const qty = Math.min((existing?.quantity ?? 0) + quantity, product.stock);
            const snapshot = {
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                stock: product.stock,
                image_url: product.image_url,
                vendor: product.vendor?.shop_name,
            };
            persist(existing ? items.map((i) => (i.product.id === product.id ? { product: snapshot, quantity: qty } : i)) : [...items, { product: snapshot, quantity: qty }]);
        };
        const setQuantity = (id, quantity) =>
            persist(quantity <= 0 ? items.filter((i) => i.product.id !== id) : items.map((i) => (i.product.id === id ? { ...i, quantity: Math.min(quantity, i.product.stock) } : i)));
        const clear = () => persist([]);

        return {
            items,
            add,
            setQuantity,
            remove: (id) => setQuantity(id, 0),
            clear,
            count: items.reduce((s, i) => s + i.quantity, 0),
            subtotal: items.reduce((s, i) => s + i.quantity * i.product.price, 0),
        };
    }, [items]);

    return createElement(CartContext.Provider, { value }, children);
}

export const useCart = () => useContext(CartContext);
