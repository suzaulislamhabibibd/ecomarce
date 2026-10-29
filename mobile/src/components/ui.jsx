import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, statusColors } from '../lib/theme';

export function Button({ title, onPress, variant = 'primary', disabled, loading, small, style }) {
    const variants = {
        primary: [styles.primary, styles.primaryText],
        secondary: [styles.secondary, styles.secondaryText],
        danger: [styles.dangerBtn, styles.primaryText],
    };
    const [box, text] = variants[variant];
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [styles.button, small && styles.small, box, (disabled || loading) && styles.disabled, pressed && styles.pressed, style]}
        >
            {loading ? <ActivityIndicator color={variant === 'secondary' ? colors.brand : '#fff'} /> : <Text style={[styles.buttonText, small && styles.smallText, text]}>{title}</Text>}
        </Pressable>
    );
}

export function Field({ label, error, style, ...props }) {
    return (
        <View style={[styles.field, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput placeholderTextColor={colors.muted} style={[styles.input, error && styles.inputError]} {...props} />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

export function Card({ children, style }) {
    return <View style={[styles.card, style]}>{children}</View>;
}

export function Badge({ status }) {
    const [bg, fg] = statusColors[status] || ['#e2e8f0', '#334155'];
    return (
        <View style={[styles.badge, { backgroundColor: bg }]}>
            <Text style={[styles.badgeText, { color: fg }]}>{status}</Text>
        </View>
    );
}

export function Stat({ label, value, accent }) {
    return (
        <Card style={styles.stat}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, accent && { color: accent }]}>{value}</Text>
        </Card>
    );
}

export function Empty({ text }) {
    return <Text style={styles.empty}>{text}</Text>;
}

export function Loading() {
    return (
        <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.brand} />
        </View>
    );
}

export const styles = StyleSheet.create({
    button: { borderRadius: 10, paddingVertical: 13, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
    small: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 8 },
    buttonText: { fontSize: 15, fontWeight: '700' },
    smallText: { fontSize: 13 },
    primary: { backgroundColor: colors.brand },
    primaryText: { color: '#fff' },
    secondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
    secondaryText: { color: colors.text },
    dangerBtn: { backgroundColor: colors.danger },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.8 },
    field: { marginBottom: 14 },
    label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: colors.text },
    inputError: { borderColor: colors.danger },
    error: { color: colors.danger, fontSize: 12, marginTop: 4 },
    card: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14 },
    badge: { alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 3 },
    badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
    stat: { flex: 1, minWidth: '45%' },
    statLabel: { fontSize: 11, color: colors.muted, fontWeight: '700', textTransform: 'uppercase' },
    statValue: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 4 },
    empty: { textAlign: 'center', color: colors.muted, padding: 30 },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
});
