import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import ProductCard from '../../components/ProductCard';
import { Empty, Loading } from '../../components/ui';
import { api } from '../../lib/api';
import { colors } from '../../lib/theme';

export default function Home() {
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState(null);
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api('/home').then((d) => setCategories(d.categories)).catch(() => {});
    }, []);

    const load = useCallback(
        async (nextPage = 1) => {
            setLoading(true);
            setError(null);
            try {
                const res = await api('/products', { query: { q: query, category, page: nextPage } });
                setProducts((prev) => (nextPage === 1 ? res.data : [...prev, ...res.data]));
                setPage(res.current_page);
                setLastPage(res.last_page);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        },
        [query, category],
    );

    useEffect(() => {
        load(1);
    }, [load]);

    const header = (
        <View>
            <View style={styles.searchRow}>
                <TextInput
                    style={styles.search}
                    placeholder="Search products..."
                    placeholderTextColor={colors.muted}
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={() => setQuery(search.trim())}
                    returnKeyType="search"
                />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                {[{ id: 0, name: 'All', slug: null }, ...categories].map((c) => (
                    <Pressable key={c.id} onPress={() => setCategory(c.slug)} style={[styles.chip, category === c.slug && styles.chipActive]}>
                        <Text style={[styles.chipText, category === c.slug && styles.chipTextActive]}>{c.name}</Text>
                    </Pressable>
                ))}
            </ScrollView>
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );

    return (
        <FlatList
            data={products}
            keyExtractor={(p) => String(p.id)}
            numColumns={2}
            renderItem={({ item }) => <ProductCard product={item} />}
            ListHeaderComponent={header}
            ListEmptyComponent={loading ? <Loading /> : <Empty text="No products found." />}
            contentContainerStyle={styles.list}
            onEndReached={() => !loading && page < lastPage && load(page + 1)}
            onEndReachedThreshold={0.5}
            refreshControl={<RefreshControl refreshing={loading && page === 1 && products.length > 0} onRefresh={() => load(1)} colors={[colors.brand]} />}
        />
    );
}

const styles = StyleSheet.create({
    list: { padding: 5, paddingBottom: 20 },
    searchRow: { padding: 5 },
    search: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: colors.text },
    chips: { paddingHorizontal: 5, paddingVertical: 8, gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
    chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
    chipText: { color: colors.text, fontWeight: '600', fontSize: 13 },
    chipTextActive: { color: '#fff' },
    error: { color: colors.danger, textAlign: 'center', padding: 10 },
});
