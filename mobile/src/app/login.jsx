import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { Button, Field } from '../components/ui';
import { useAuth } from '../lib/auth';
import { colors } from '../lib/theme';

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        setLoading(true);
        setError(null);
        try {
            await login(email.trim(), password);
            router.back();
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 20 }}>Welcome back</Text>
            <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" error={error} />
            <Button title="Log in" onPress={submit} loading={loading} />
            <Button title="Create an account" variant="secondary" onPress={() => router.replace('/register')} style={{ marginTop: 10 }} />
        </ScrollView>
    );
}
