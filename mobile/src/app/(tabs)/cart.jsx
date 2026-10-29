import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ProductThumb } from '../../components/ProductCard';
import { Button, Empty } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { useCart } from '../../lib/cart';
import { money } from '../../lib/format';
import { colors } from '../../lib/theme';

export default function Cart() {
    const { items, setQuantity, remove, subtotal } = useCart();
    const { user } = useAuth();

    if (!items.length) {
        return (
            <View style={styles.emptyWrap}>
                <Empty text="Your cart is empty." />
                <Button title="Browse products" onPress={() => router.navigate('/')} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={items}
                keyExtractor={(i) => String(i.product.id)}
                contentContainerStyle={{ padding: 12, gap: 10 }}
                renderItem={({ item: { product, quantity } }) => (
                    <View style={styles.row}>
                        <Pressable onPress={() => router.push(`/product/${product.slug}`)}>
                            <ProductThumb uri={product.image_url} name={product.name} style={styles.thumb} />
                        </Pressable>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
                            <Text style={styles.vendor}>{product.vendor}</Text>
                            <Text style={styles.price}>{money(product.price * quantity)}</Text>
                        </View>
                        <View style={styles.qtyCol}>
                            <View style={styles.qty}>
                                <Pressable onPress={() => setQuantity(product.id, quantity - 1)} style={styles.qtyBtn}><Text style={styles.qtyText}>−</Text></Pressable>
                                <Text style={styles.qtyValue}>{quantity}</Text>
                                <Pressable onPress={() => setQuantity(product.id, quantity + 1)} style={styles.qtyBtn}><Text style={styles.qtyText}>+</Text></Pressable>
                            </View>
                            <Pressable onPress={() => remove(product.id)}><Text style={styles.remove}>Remove</Text></Pressable>
                        </View>
                    </View>
                )}
            />
            <View style={styles.footer}>
                <View>
                    <Text style={styles.vendor}>Subtotal</Text>
                    <Text style={styles.total}>{money(subtotal)}</Text>
                </View>
                <Button title={user ? 'Checkout' : 'Log in to checkout'} onPress={() => router.push(user ? '/checkout' : '/login')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    emptyWrap: { flex: 1, justifyContent: 'center', padding: 30 },
    row: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 10, alignItems: 'center' },
    thumb: { width: 64, height: 64, borderRadius: 10 },
    name: { fontWeight: '600', color: colors.text },
    vendor: { fontSize: 12, color: colors.muted },
    price: { fontWeight: '800', color: colors.brandDark, marginTop: 2 },
    qtyCol: { alignItems: 'flex-end', gap: 8 },
    qty: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 8 },
    qtyBtn: { paddingHorizontal: 10, paddingVertical: 4 },
    qtyText: { fontSize: 18, fontWeight: '700', color: colors.text },
    qtyValue: { minWidth: 22, textAlign: 'center', fontWeight: '700' },
    remove: { color: colors.danger, fontSize: 12 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: colors.border },
    total: { fontSize: 20, fontWeight: '800', color: colors.text },
});
