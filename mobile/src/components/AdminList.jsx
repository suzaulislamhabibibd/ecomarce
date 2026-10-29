import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { api } from '../lib/api';
import { colors } from '../lib/theme';
import { Empty, Loading } from './ui';

/**
 * Paginated admin list with status filter tabs. `renderItem` receives
 * the row and an `act(path, body, confirmText)` helper that PATCHes and reloads.
 */
export default function AdminList({ endpoint, statuses, renderItem }) {
    const [status, setStatus] = useState(statuses[0][0]);
    const [rows, setRows] = useState(null);
    const [error, setError] = useState(null);

    const load = useCallback(() => {
        setError(null);
        return api(endpoint, { query: { status } })
            .then((r) => setRows(r.data))
            .catch((e) => setError(e.message));
    }, [endpoint, status]);

    useEffect(() => {
        setRows(null);
        load();
    }, [load]);

    const act = (path, body, confirmText) => {
        const run = () => api(path, { method: 'PATCH', body }).then(load).catch((e) => Alert.alert('Error', e.message));
        if (!confirmText) return run();
        Alert.alert('Are you sure?', confirmText, [{ text: 'Cancel', style: 'cancel' }, { text: 'Yes', onPress: run }]);
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.tabs}>
                {statuses.map(([value, label]) => (
                    <Pressable key={value} onPress={() => setStatus(value)} style={[styles.tab, status === value && styles.tabActive]}>
                        <Text style={[styles.tabText, status === value && { color: '#fff' }]}>{label}</Text>
                    </Pressable>
                ))}
            </View>
            {error ? (
                <Empty text={error} />
            ) : !rows ? (
                <Loading />
            ) : (
                <FlatList
                    data={rows}
                    keyExtractor={(r) => String(r.id)}
                    contentContainerStyle={{ padding: 12, gap: 10 }}
                    ListEmptyComponent={<Empty text="Nothing here." />}
                    refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
                    renderItem={({ item }) => renderItem(item, act)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 12, paddingBottom: 0 },
    tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
    tabActive: { backgroundColor: colors.brand, borderColor: colors.brand },
    tabText: { fontWeight: '600', fontSize: 13, color: colors.text },
});
