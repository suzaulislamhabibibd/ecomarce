import { StyleSheet, Text, View } from 'react-native';
import AdminList from '../../components/AdminList';
import { Badge, Button, Card } from '../../components/ui';
import { date, money } from '../../lib/format';
import { colors } from '../../lib/theme';

export default function AdminPayouts() {
    return (
        <AdminList
            endpoint="/admin/payouts"
            statuses={[['requested', 'Requested'], ['paid', 'Paid'], ['rejected', 'Rejected'], ['', 'All']]}
            renderItem={(p, act) => (
                <Card>
                    <View style={styles.head}>
                        <Text style={styles.amount}>{money(p.amount)}</Text>
                        <Badge status={p.status} />
                    </View>
                    <Text style={styles.payee}>
                        {p.vendor ? `${p.vendor.shop_name} (vendor)` : `${p.affiliate?.user?.name} (affiliate ${p.affiliate?.code})`}
                    </Text>
                    <Text style={styles.muted}>{p.method} · {p.account} · {date(p.created_at)}</Text>
                    {p.admin_note ? <Text style={styles.muted}>Note: {p.admin_note}</Text> : null}
                    {p.status === 'requested' && (
                        <View style={styles.actions}>
                            <Button small title="Mark paid" onPress={() => act(`/admin/payouts/${p.id}`, { status: 'paid' }, `Confirm you sent ${money(p.amount)}?`)} />
                            <Button small variant="danger" title="Reject" onPress={() => act(`/admin/payouts/${p.id}`, { status: 'rejected' }, 'Reject this payout request?')} />
                        </View>
                    )}
                </Card>
            )}
        />
    );
}

const styles = StyleSheet.create({
    head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    amount: { fontWeight: '800', fontSize: 18, color: colors.text },
    payee: { fontWeight: '600', marginTop: 4, color: colors.text },
    muted: { color: colors.muted, fontSize: 12, marginTop: 3, textTransform: 'none' },
    actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
});
