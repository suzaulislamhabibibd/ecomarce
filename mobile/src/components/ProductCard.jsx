import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { money } from '../lib/format';
import { colors } from '../lib/theme';

const palette = ['#6ee7b7', '#fcd34d', '#93c5fd', '#f9a8d4', '#bef264', '#c4b5fd'];

export function ProductThumb({ uri, name, style }) {
    if (uri) return <Image source={{ uri }} style={[styles.thumb, style]} resizeMode="cover" />;
    return (
        <View style={[styles.thumb, styles.placeholder, { backgroundColor: palette[(name || '').length % palette.length] }, style]}>
            <Text style={styles.initial}>{(name || '?').charAt(0)}</Text>
        </View>
    );
}

export default function ProductCard({ product }) {
    const discount = product.compare_price > product.price ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0;

    return (
        <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]} onPress={() => router.push(`/product/${product.slug}`)}>
            <View>
                <ProductThumb uri={product.image_url} name={product.name} style={styles.image} />
                {discount > 0 && <Text style={styles.discount}>-{discount}%</Text>}
            </View>
            <View style={styles.body}>
                <Text style={styles.vendor} numberOfLines={1}>{product.vendor?.shop_name}</Text>
                <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.price}>{money(product.price)}</Text>
                {discount > 0 && <Text style={styles.compare}>{money(product.compare_price)}</Text>}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', margin: 5 },
    thumb: { width: '100%', aspectRatio: 1 },
    image: { borderRadius: 0 },
    placeholder: { alignItems: 'center', justifyContent: 'center' },
    initial: { fontSize: 36, fontWeight: '800', color: 'rgba(255,255,255,0.95)' },
    discount: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.danger, color: '#fff', fontSize: 11, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
    body: { padding: 10 },
    vendor: { fontSize: 11, color: colors.muted },
    name: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 2, minHeight: 36 },
    price: { fontSize: 16, fontWeight: '800', color: colors.brandDark, marginTop: 4 },
    compare: { fontSize: 12, color: colors.muted, textDecorationLine: 'line-through' },
});
