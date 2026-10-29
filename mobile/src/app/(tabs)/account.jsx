import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { colors } from '../../lib/theme';

function Row({ icon, label, href }) {
    return (
        <Pressable style={styles.row} onPress={() => router.push(href)}>
            <Ionicons name={icon} size={20} color={colors.brand} />
            <Text style={styles.rowText}>{label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
    );
}

export default function Account() {
    const { user, logout } = useAuth();

    if (!user) {
        return (
            <View style={styles.guest}>
                <Ionicons name="person-circle-outline" size={72} color={colors.brand} />
                <Text style={styles.title}>Welcome to HaatBazar</Text>
                <Text style={styles.muted}>Log in to place orders, track deliveries or use your affiliate account.</Text>
                <Button title="Log in" onPress={() => router.push('/login')} style={{ alignSelf: 'stretch', marginTop: 20 }} />
                <Button title="Create account" variant="secondary" onPress={() => router.push('/register')} style={{ alignSelf: 'stretch', marginTop: 10 }} />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
            <Card style={styles.profile}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{user.name.charAt(0)}</Text></View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{user.name}</Text>
                    <Text style={styles.muted}>{user.email}</Text>
                    <Text style={[styles.muted, { textTransform: 'capitalize' }]}>{user.role}</Text>
                </View>
            </Card>

            <Card style={{ padding: 0 }}>
                <Row icon="receipt-outline" label="My orders" href="/orders" />
                {user.role === 'affiliate' && <Row icon="trending-up-outline" label="Affiliate dashboard" href="/affiliate" />}
                {user.role === 'admin' && <Row icon="shield-checkmark-outline" label="Admin panel" href="/admin" />}
            </Card>

            {user.affiliate && (
                <Card>
                    <Text style={styles.muted}>Affiliate code</Text>
                    <Text style={styles.code}>{user.affiliate.code}</Text>
                    <Badge status={user.affiliate.status} />
                </Card>
            )}
            {user.vendor && (
                <Card>
                    <Text style={styles.muted}>Manage your shop "{user.vendor.shop_name}" from the Seller Center on the website.</Text>
                </Card>
            )}

            <Button title="Log out" variant="secondary" onPress={logout} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    guest: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
    title: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 4 },
    muted: { color: colors.muted, textAlign: 'left' },
    profile: { flexDirection: 'row', gap: 14, alignItems: 'center' },
    avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.brandLight, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 22, fontWeight: '800', color: colors.brandDark },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderColor: colors.border },
    rowText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
    code: { fontSize: 24, fontWeight: '800', letterSpacing: 3, color: colors.brandDark, marginVertical: 6 },
});
