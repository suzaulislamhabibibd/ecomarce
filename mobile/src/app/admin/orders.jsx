import { StyleSheet, Text, View } from 'react-native';
import AdminList from '../../components/AdminList';
import { Badge, Card } from '../../components/ui';
import { date, money } from '../../lib/format';
import { colors } from '../../lib/theme';

export default function AdminOrders() {
    return (
        <AdminList
            endpoint="/admin/orders"
            statuses={[['', 'All'], ['pending', 'Pending'], ['processing', 'Processing'], ['shipped', 'Shipped'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']]}
            renderItem={(o) => (
                <Card style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.number}>{o.number}</Text>
                        <Text style={styles.muted}>{o.user?.name} · {o.items_count} items · {date(o.created_at)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <Text style={{ fontWeight: '800' }}>{money(o.total)}</Text>
                        <Badge status={o.status} />
                    </View>
                </Card>
            )}
        />
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center' },
    number: { fontWeight: '800', fontFamily: 'monospace', color: colors.text },
    muted: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
