import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Badge, Button, Card, Empty, Field, Loading, Stat } from '../../components/ui';
import { api } from '../../lib/api';
import { date, money } from '../../lib/format';
import { colors } from '../../lib/theme';

export default function AffiliateDashboard() {
    const [data, setData] = useState(null);
    const [commissions, setCommissions] = useState([]);
    const [error, setError] = useState(null);
    const [payout, setPayout] = useState({ amount: '', method: 'bkash', account: '' });
    const [sending, setSending] = useState(false);

    const load = useCallback(async () => {
        try {
            const [dash, list] = await Promise.all([api('/affiliate/dashboard'), api('/affiliate/commissions')]);
            setData(dash);
            setCommissions(list.data);
        } catch (e) {
            setError(e.message);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load]),
    );

    const requestPayout = async () => {
        setSending(true);
        try {
            await api('/affiliate/payouts', { method: 'POST', body: payout });
            Alert.alert('Request sent', 'Your withdrawal request was submitted.');
            setPayout({ ...payout, amount: '' });
            load();
        } catch (e) {
            Alert.alert('Could not request payout', e.message);
        } finally {
            setSending(false);
        }
    };

    if (error) return <Empty text={error} />;
    if (!data) return <Loading />;
    const { affiliate, stats, home_link: link } = data;

    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
            {affiliate.status !== 'approved' && (
                <Card style={{ backgroundColor: '#fef3c7', borderColor: '#fcd34d' }}>
                    <Text style={{ color: '#92400e' }}>
                        {affiliate.status === 'pending' ? 'Your account is awaiting admin approval. Links start earning once approved.' : 'Your affiliate account is suspended.'}
                    </Text>
                </Card>
            )}
            <View style={styles.grid}>
                <Stat label="Clicks" value={stats.clicks} />
                <Stat label="Orders" value={stats.orders} />
                <Stat label="Pending" value={money(stats.pending)} accent={colors.warning} />
                <Stat label="Balance" value={money(stats.balance)} accent={colors.brandDark} />
            </View>

            <Card style={styles.qr}>
                <QRCode value={`${link}&src=qr`} size={150} />
                <Text style={styles.code}>{affiliate.code}</Text>
                <Text style={styles.muted}>Show this QR to customers or share your link. You earn {stats.rate}% on delivered orders.</Text>
                <Button title="Share my link" onPress={() => Share.share({ message: `Shop on HaatBazar: ${link}` })} style={{ marginTop: 10, alignSelf: 'stretch' }} />
                <Text style={styles.tip}>Tip: open any product in the app and tap "Share link" to share it with your code.</Text>
            </Card>

            <Card>
                <Text style={styles.title}>Withdraw earnings</Text>
                <Field label="Amount (৳, min 100)" keyboardType="numeric" value={payout.amount} onChangeText={(amount) => setPayout({ ...payout, amount })} />
                <View style={styles.methods}>
                    {['bkash', 'nagad', 'rocket', 'bank'].map((m) => (
                        <Button key={m} small title={m} variant={payout.method === m ? 'primary' : 'secondary'} onPress={() => setPayout({ ...payout, method: m })} />
                    ))}
                </View>
                <Field label="Account number" value={payout.account} onChangeText={(account) => setPayout({ ...payout, account })} />
                <Button title="Request payout" onPress={requestPayout} loading={sending} disabled={stats.balance < 100} />
            </Card>

            <Text style={styles.title}>Commissions</Text>
            {commissions.length ? (
                commissions.map((c) => (
                    <Card key={c.id} style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '700', fontFamily: 'monospace' }}>{c.order?.number}</Text>
                            <Text style={styles.muted}>{date(c.created_at)} · order {money(c.order_amount)}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                            <Text style={{ fontWeight: '800', color: colors.brandDark }}>{money(c.amount)}</Text>
                            <Badge status={c.status} />
                        </View>
                    </Card>
                ))
            ) : (
                <Empty text="No referred orders yet." />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    qr: { alignItems: 'center' },
    code: { fontSize: 26, fontWeight: '800', letterSpacing: 4, color: colors.brandDark, marginTop: 12 },
    muted: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 2 },
    tip: { color: colors.muted, fontSize: 11, marginTop: 10, textAlign: 'center' },
    title: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 10 },
    methods: { flexDirection: 'row', gap: 6, marginBottom: 14, flexWrap: 'wrap' },
    row: { flexDirection: 'row', alignItems: 'center' },
});
