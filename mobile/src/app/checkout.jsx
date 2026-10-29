import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field } from '../components/ui';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/cart';
import { money } from '../lib/format';
import { getReferral } from '../lib/referral';
import { colors } from '../lib/theme';

export default function Checkout() {
    const { user } = useAuth();
    const { items, subtotal, clear } = useCart();
    const [form, setForm] = useState({ shipping_name: user?.name || '', shipping_phone: user?.phone || '', shipping_address: '', shipping_city: 'Dhaka', note: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const set = (key) => (value) => setForm({ ...form, [key]: value });

    const placeOrder = async () => {
        setLoading(true);
        setErrors({});
        try {
            const { order } = await api('/orders', {
                method: 'POST',
                body: { ...form, items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })), ref: await getReferral() },
            });
            clear();
            Alert.alert('Order placed', `Order ${order.number} confirmed. Pay with cash on delivery.`);
            router.replace(`/orders/${order.id}`);
        } catch (e) {
            const fieldErrors = Object.fromEntries(Object.entries(e.errors || {}).map(([k, v]) => [k, v[0]]));
            setErrors(fieldErrors);
            if (!Object.keys(fieldErrors).some((k) => k.startsWith('shipping_')) || fieldErrors.cart) Alert.alert('Could not place order', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <Card style={{ marginBottom: 16 }}>
                {items.map(({ product, quantity }) => (
                    <View key={product.id} style={styles.line}>
                        <Text style={{ flex: 1 }} numberOfLines={1}>{product.name} × {quantity}</Text>
                        <Text>{money(product.price * quantity)}</Text>
                    </View>
                ))}
                <View style={[styles.line, styles.totalLine]}>
                    <Text style={styles.total}>Subtotal</Text>
                    <Text style={styles.total}>{money(subtotal)}</Text>
                </View>
                <Text style={styles.muted}>A delivery fee is added. The final total is shown on your order.</Text>
            </Card>
            <Field label="Full name" value={form.shipping_name} onChangeText={set('shipping_name')} error={errors.shipping_name} />
            <Field label="Phone" value={form.shipping_phone} onChangeText={set('shipping_phone')} keyboardType="phone-pad" error={errors.shipping_phone} />
            <Field label="Address" placeholder="House, road, area" value={form.shipping_address} onChangeText={set('shipping_address')} error={errors.shipping_address} />
            <Field label="City" value={form.shipping_city} onChangeText={set('shipping_city')} error={errors.shipping_city} />
            <Field label="Note (optional)" value={form.note} onChangeText={set('note')} />
            <Card style={styles.cod}>
                <Text style={{ fontWeight: '800', color: colors.brandDark }}>💵 Cash on Delivery</Text>
                <Text style={styles.muted}>Pay when you receive your order.</Text>
            </Card>
            <Button title="Place order" onPress={placeOrder} loading={loading} disabled={!items.length} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    line: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 4 },
    totalLine: { borderTopWidth: 1, borderColor: colors.border, marginTop: 6, paddingTop: 8 },
    total: { fontWeight: '800', fontSize: 16 },
    muted: { color: colors.muted, fontSize: 12, marginTop: 4 },
    cod: { backgroundColor: colors.brandLight, borderColor: colors.brand, marginBottom: 16 },
});
