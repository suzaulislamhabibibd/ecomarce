import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge, Empty, Loading } from '../../components/ui';
import { api } from '../../lib/api';
import { date, money } from '../../lib/format';
import { colors } from '../../lib/theme';

export default function Orders() {
    const [orders, setOrders] = useState(null);
    const [error, setError] = useState(null);

    useFocusEffect(
        useCallback(() => {
            api('/orders').then((r) => setOrders(r.data)).catch((e) => setError(e.message));
        }, []),
    );

    if (error) return <Empty text={error} />;
    if (!orders) return <Loading />;

    return (
        <FlatList
            data={orders}
            keyExtractor={(o) => String(o.id)}
            contentContainerStyle={{ padding: 12, gap: 10 }}
            ListEmptyComponent={<Empty text="You have no orders yet." />}
            renderItem={({ item }) => (
                <Pressable style={styles.row} onPress={() => router.push(`/orders/${item.id}`)}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.number}>{item.number}</Text>
                        <Text style={styles.muted}>{date(item.created_at)} · {item.items_count} items</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <Text style={styles.total}>{money(item.total)}</Text>
                        <Badge status={item.status} />
                    </View>
                </Pressable>
            )}
        />
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: 'center' },
    number: { fontWeight: '800', fontFamily: 'monospace', color: colors.text },
    muted: { color: colors.muted, fontSize: 12, marginTop: 2 },
    total: { fontWeight: '800', color: colors.text },
});
