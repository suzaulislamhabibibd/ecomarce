import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, Empty, Loading } from '../../components/ui';
import { api } from '../../lib/api';
import { date, money } from '../../lib/format';
import { colors } from '../../lib/theme';

export default function OrderDetail() {
    const { id } = useLocalSearchParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const load = useCallback(() => api(`/orders/${id}`).then(setData).catch((e) => setError(e.message)), [id]);
    useEffect(() => {
        load();
    }, [load]);

    const cancel = () =>
        Alert.alert('Cancel order?', 'All items will be cancelled.', [
            { text: 'Keep order', style: 'cancel' },
            {
                text: 'Cancel order',
                style: 'destructive',
                onPress: () => api(`/orders/${id}/cancel`, { method: 'POST' }).then(load).catch((e) => Alert.alert('Error', e.message)),
            },
        ]);

    if (error) return <Empty text={error} />;
    if (!data) return <Loading />;
    const { order, cancellable } = data;

    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            <Card>
                <Text style={styles.number}>{order.number}</Text>
                <Text style={styles.muted}>Placed {date(order.created_at)}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                    <Badge status={order.status} />
                    <Badge status={order.payment_status} />
                </View>
            </Card>
            <Card>
                {order.items.map((item) => (
                    <View key={item.id} style={styles.item}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '600' }}>{item.product_name} × {item.quantity}</Text>
                            <Text style={styles.muted}>Sold by {item.vendor?.shop_name}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                            <Text style={{ fontWeight: '700' }}>{money(item.line_total)}</Text>
                            <Badge status={item.status} />
                        </View>
                    </View>
                ))}
                <View style={styles.sum}><Text>Subtotal</Text><Text>{money(order.subtotal)}</Text></View>
                <View style={styles.sum}><Text>Shipping</Text><Text>{money(order.shipping_fee)}</Text></View>
                <View style={styles.sum}><Text style={styles.total}>Total</Text><Text style={styles.total}>{money(order.total)}</Text></View>
            </Card>
            <Card>
                <Text style={{ fontWeight: '800', marginBottom: 4 }}>Shipping to</Text>
                <Text>{order.shipping_name} · {order.shipping_phone}</Text>
                <Text style={styles.muted}>{order.shipping_address}, {order.shipping_city}</Text>
            </Card>
            {cancellable && <Button title="Cancel order" variant="danger" onPress={cancel} />}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    number: { fontSize: 18, fontWeight: '800', fontFamily: 'monospace', color: colors.text },
    muted: { color: colors.muted, fontSize: 12, marginTop: 2 },
    item: { flexDirection: 'row', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderColor: colors.border },
    sum: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
    total: { fontWeight: '800', fontSize: 16 },
});
