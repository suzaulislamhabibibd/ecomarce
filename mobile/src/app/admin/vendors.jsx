import { StyleSheet, Text, View } from 'react-native';
import AdminList from '../../components/AdminList';
import { Badge, Button, Card } from '../../components/ui';
import { colors } from '../../lib/theme';

export default function AdminVendors() {
    return (
        <AdminList
            endpoint="/admin/vendors"
            statuses={[['pending', 'Pending'], ['approved', 'Approved'], ['suspended', 'Suspended'], ['', 'All']]}
            renderItem={(v, act) => (
                <Card>
                    <View style={styles.head}>
                        <Text style={styles.name}>{v.shop_name}</Text>
                        <Badge status={v.status} />
                    </View>
                    <Text style={styles.muted}>{v.user?.name} · {v.user?.email}</Text>
                    <Text style={styles.muted}>{v.products_count} products · commission {v.commission_rate ?? 'global'}{v.commission_rate !== null ? '%' : ''}</Text>
                    <View style={styles.actions}>
                        {v.status !== 'approved' && <Button small title="Approve" onPress={() => act(`/admin/vendors/${v.id}`, { status: 'approved' })} />}
                        {v.status !== 'suspended' && <Button small variant="danger" title="Suspend" onPress={() => act(`/admin/vendors/${v.id}`, { status: 'suspended' }, `Suspend ${v.shop_name}? Its products will be hidden.`)} />}
                    </View>
                </Card>
            )}
        />
    );
}

const styles = StyleSheet.create({
    head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontWeight: '800', fontSize: 16, color: colors.text },
    muted: { color: colors.muted, fontSize: 12, marginTop: 3 },
    actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
});
