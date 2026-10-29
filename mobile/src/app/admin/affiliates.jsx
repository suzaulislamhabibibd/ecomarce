import { StyleSheet, Text, View } from 'react-native';
import AdminList from '../../components/AdminList';
import { Badge, Button, Card } from '../../components/ui';
import { colors } from '../../lib/theme';

export default function AdminAffiliates() {
    return (
        <AdminList
            endpoint="/admin/affiliates"
            statuses={[['pending', 'Pending'], ['approved', 'Approved'], ['suspended', 'Suspended'], ['', 'All']]}
            renderItem={(a, act) => (
                <Card>
                    <View style={styles.head}>
                        <Text style={styles.name}>{a.user?.name}</Text>
                        <Badge status={a.status} />
                    </View>
                    <Text style={styles.code}>{a.code}</Text>
                    <Text style={styles.muted}>{a.user?.email} · {a.clicks_count} clicks</Text>
                    {a.promo_channel ? <Text style={styles.muted}>Promotes on: {a.promo_channel}</Text> : null}
                    <View style={styles.actions}>
                        {a.status !== 'approved' && <Button small title="Approve" onPress={() => act(`/admin/affiliates/${a.id}`, { status: 'approved' })} />}
                        {a.status !== 'suspended' && <Button small variant="danger" title="Suspend" onPress={() => act(`/admin/affiliates/${a.id}`, { status: 'suspended' }, `Suspend affiliate ${a.code}?`)} />}
                    </View>
                </Card>
            )}
        />
    );
}

const styles = StyleSheet.create({
    head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontWeight: '800', fontSize: 16, color: colors.text },
    code: { fontFamily: 'monospace', fontWeight: '700', color: colors.brandDark, marginTop: 2 },
    muted: { color: colors.muted, fontSize: 12, marginTop: 3 },
    actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
});
