import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { ProductThumb } from '../../components/ProductCard';
import { Button, Card, Empty, Loading } from '../../components/ui';
import { api } from '../../lib/api';
import { useCart } from '../../lib/cart';
import { date, money } from '../../lib/format';
import { captureReferral } from '../../lib/referral';
import { colors } from '../../lib/theme';

export default function ProductScreen() {
    // Opened from the catalog, a scanned QR code or an https/haatbazar:// deep link (?ref=CODE).
    const { slug, ref } = useLocalSearchParams();
    const { add } = useCart();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        setData(null);
        api(`/products/${encodeURIComponent(slug)}`)
            .then(setData)
            .catch((e) => setError(e.status === 404 ? 'This product is no longer available.' : e.message));
        if (ref) captureReferral(String(ref), String(slug), 'app');
    }, [slug, ref]);

    if (error) return <Empty text={error} />;
    if (!data) return <Loading />;

    const { product, reviews, url, affiliate_link: affiliateLink } = data;
    const shareUrl = affiliateLink || url;

    const addToCart = (buyNow) => {
        add(product, quantity);
        if (buyNow) router.push('/cart');
        else Alert.alert('Added to cart', `${product.name} × ${quantity}`);
    };

    return (
        <>
            <Stack.Screen options={{ title: product.name }} />
            <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
                <ProductThumb uri={product.image_url} name={product.name} style={styles.image} />
                <View style={styles.body}>
                    <Text style={styles.vendor}>{product.vendor?.shop_name}</Text>
                    <Text style={styles.name}>{product.name}</Text>
                    <Text style={styles.rating}>
                        {'★'.repeat(Math.round(product.reviews_avg_rating || 0))}
                        <Text style={{ color: colors.border }}>{'★'.repeat(5 - Math.round(product.reviews_avg_rating || 0))}</Text>
                        <Text style={styles.muted}>  ({product.reviews_count} reviews)</Text>
                    </Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>{money(product.price)}</Text>
                        {product.compare_price > product.price && <Text style={styles.compare}>{money(product.compare_price)}</Text>}
                    </View>
                    <Text style={[styles.stock, { color: product.stock > 0 ? colors.brandDark : colors.danger }]}>
                        {product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock'}
                    </Text>

                    {product.stock > 0 && (
                        <>
                            <View style={styles.qtyRow}>
                                <Button small variant="secondary" title="−" onPress={() => setQuantity(Math.max(1, quantity - 1))} />
                                <Text style={styles.qty}>{quantity}</Text>
                                <Button small variant="secondary" title="+" onPress={() => setQuantity(Math.min(product.stock, quantity + 1))} />
                            </View>
                            <View style={styles.actions}>
                                <Button title="Add to cart" variant="secondary" onPress={() => addToCart(false)} style={{ flex: 1 }} />
                                <Button title="Buy now" onPress={() => addToCart(true)} style={{ flex: 1 }} />
                            </View>
                        </>
                    )}

                    <Text style={styles.section}>Description</Text>
                    <Text style={styles.desc}>{product.description || 'No description provided.'}</Text>

                    <Card style={styles.qrCard}>
                        <QRCode value={shareUrl} size={110} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.qrTitle}>{affiliateLink ? 'Your affiliate QR' : 'Share this product'}</Text>
                            <Text style={styles.muted}>{affiliateLink ? 'Orders from this code earn you commission.' : 'Friends can scan it with the HaatBazar app.'}</Text>
                            <Button small title="Share link" onPress={() => Share.share({ message: `${product.name} - ${money(product.price)}\n${shareUrl}` })} style={{ marginTop: 8, alignSelf: 'flex-start' }} />
                        </View>
                    </Card>

                    <Text style={styles.section}>Reviews</Text>
                    {reviews.length ? (
                        reviews.map((r) => (
                            <Card key={r.id} style={{ marginBottom: 8 }}>
                                <Text style={{ fontWeight: '700' }}>{r.user?.name} <Text style={styles.rating}>{'★'.repeat(r.rating)}</Text></Text>
                                {r.comment ? <Text style={styles.desc}>{r.comment}</Text> : null}
                                <Text style={styles.muted}>{date(r.created_at)}</Text>
                            </Card>
                        ))
                    ) : (
                        <Text style={styles.muted}>No reviews yet.</Text>
                    )}
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    image: { width: '100%', aspectRatio: 1 },
    body: { padding: 16 },
    vendor: { color: colors.brand, fontWeight: '600' },
    name: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 2 },
    rating: { color: '#f59e0b', marginTop: 4 },
    muted: { color: colors.muted, fontSize: 13 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 10 },
    price: { fontSize: 26, fontWeight: '800', color: colors.brandDark },
    compare: { fontSize: 16, color: colors.muted, textDecorationLine: 'line-through' },
    stock: { marginTop: 4, fontWeight: '600' },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
    qty: { fontSize: 18, fontWeight: '800', minWidth: 24, textAlign: 'center' },
    actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
    section: { fontSize: 17, fontWeight: '800', color: colors.text, marginTop: 22, marginBottom: 8 },
    desc: { color: '#475569', lineHeight: 21 },
    qrCard: { flexDirection: 'row', gap: 14, alignItems: 'center', marginTop: 20, borderStyle: 'dashed', borderColor: colors.brand },
    qrTitle: { fontWeight: '800', color: colors.text },
});
