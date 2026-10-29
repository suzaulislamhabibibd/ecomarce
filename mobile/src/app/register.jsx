import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Field } from '../components/ui';
import { useAuth } from '../lib/auth';
import { colors } from '../lib/theme';

export default function Register() {
    const { register } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '', account_type: 'customer', promo_channel: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const set = (key) => (value) => setForm({ ...form, [key]: value });

    const submit = async () => {
        setLoading(true);
        setErrors({});
        try {
            const user = await register(form);
            router.replace(user.role === 'affiliate' ? '/affiliate' : '/');
        } catch (e) {
            setErrors(Object.keys(e.errors).length ? Object.fromEntries(Object.entries(e.errors).map(([k, v]) => [k, v[0]])) : { name: e.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
            <View style={styles.tabs}>
                {[['customer', 'I want to shop'], ['affiliate', 'Affiliate']].map(([type, label]) => (
                    <Pressable key={type} onPress={() => set('account_type')(type)} style={[styles.tab, form.account_type === type && styles.tabActive]}>
                        <Text style={[styles.tabText, form.account_type === type && { color: colors.text }]}>{label}</Text>
                    </Pressable>
                ))}
            </View>
            {form.account_type === 'affiliate' && (
                <Text style={styles.note}>Share product links and QR codes and earn commission on every delivered order.</Text>
            )}
            <Field label="Full name" value={form.name} onChangeText={set('name')} error={errors.name} />
            <Field label="Email" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
            <Field label="Phone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" error={errors.phone} />
            {form.account_type === 'affiliate' && (
                <Field label="Where will you promote?" placeholder="Facebook page, YouTube..." value={form.promo_channel} onChangeText={set('promo_channel')} error={errors.promo_channel} />
            )}
            <Field label="Password" value={form.password} onChangeText={set('password')} secureTextEntry error={errors.password} />
            <Field label="Confirm password" value={form.password_confirmation} onChangeText={set('password_confirmation')} secureTextEntry />
            <Button title="Create account" onPress={submit} loading={loading} />
            <Text style={styles.footnote}>Want to sell? Open your shop from the website.</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    tabs: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 10, padding: 4, marginBottom: 16 },
    tab: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
    tabActive: { backgroundColor: '#fff' },
    tabText: { fontWeight: '700', color: colors.muted },
    note: { backgroundColor: colors.brandLight, color: colors.brandDark, padding: 12, borderRadius: 10, marginBottom: 14, fontSize: 13 },
    footnote: { textAlign: 'center', color: colors.muted, marginTop: 16, fontSize: 13 },
});
