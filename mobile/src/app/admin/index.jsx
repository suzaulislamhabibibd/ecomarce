import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Empty, Loading, Stat } from '../../components/ui';
import { api } from '../../lib/api';
import { money } from '../../lib/format';
import { colors } from '../../lib/theme';

export default function AdminHome() {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const load = useCallback(() => api('/admin/stats').then(setStats).catch((e) => setError(e.message)), []);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load]),
    );

    if (error) return <Empty text={error} />;
    if (!stats) return <Loading />;

    const links = [
        ['storefront-outline', 'Vendors', '/admin/vendors', stats.pending_vendors],
        ['people-outline', 'Affiliates', '/admin/affiliates', stats.pending_affiliates],
        ['receipt-outline', 'Orders', '/admin/orders', stats.orders_today],
        ['cash-outline', 'Payouts', '/admin/payouts', stats.pending_payouts],
    ];

    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
            <View style={styles.grid}>
                <Stat label="Gross sales" value={money(stats.gmv)} />
                <Stat label="Commission" value={money(stats.commission)} accent={colors.brandDark} />
                <Stat label="Orders" value={stats.orders} />
                <Stat label="Customers" value={stats.customers} />
            </View>
            <Text style={styles.muted}>Affiliate commission owed: {money(stats.affiliate_commission)} · Active vendors: {stats.vendors}</Text>
            <Card style={{ padding: 0 }}>
                {links.map(([icon, label, href, badge]) => (
                    <Pressable key={href} style={styles.row} onPress={() => router.push(href)}>
                        <Ionicons name={icon} size={20} color={colors.brand} />
                        <Text style={styles.rowText}>{label}</Text>
                        {badge > 0 && <Text style={styles.badge}>{badge}</Text>}
                        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                    </Pressable>
                ))}
            </Card>
            <Text style={styles.muted}>Categories, products and settings are managed from the web admin panel.</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    muted: { color: colors.muted, fontSize: 12 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderColor: colors.border },
    rowText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
    badge: { backgroundColor: colors.danger, color: '#fff', fontWeight: '800', fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, overflow: 'hidden' },
});
