import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui';
import { captureReferral, parseProductLink } from '../../lib/referral';
import { colors } from '../../lib/theme';

export default function Scan() {
    const [permission, requestPermission] = useCameraPermissions();
    const [active, setActive] = useState(false);
    const [message, setMessage] = useState(null);
    const handled = useRef(false);

    // Only keep the camera running while this tab is visible.
    useFocusEffect(
        useCallback(() => {
            handled.current = false;
            setMessage(null);
            setActive(true);
            return () => setActive(false);
        }, []),
    );

    const onScanned = async ({ data }) => {
        if (handled.current) return;
        const link = parseProductLink(data);
        if (!link) {
            setMessage('This is not a HaatBazar product QR code.');
            return;
        }
        handled.current = true;
        if (link.ref) await captureReferral(link.ref, link.slug, 'qr');
        router.push(`/product/${encodeURIComponent(link.slug)}`);
    };

    if (!permission) return <View style={styles.center} />;

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.title}>Camera access needed</Text>
                <Text style={styles.text}>Allow camera access to scan product QR codes from the HaatBazar website.</Text>
                <Button title="Allow camera" onPress={requestPermission} style={{ marginTop: 16 }} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {active && (
                <CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={onScanned} />
            )}
            <View style={styles.overlay} pointerEvents="none">
                <View style={styles.frame} />
                <Text style={styles.hint}>{message || 'Point the camera at a product QR code'}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: colors.bg },
    title: { fontSize: 18, fontWeight: '800', color: colors.text },
    text: { textAlign: 'center', color: colors.muted, marginTop: 8 },
    overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
    frame: { width: 240, height: 240, borderWidth: 3, borderColor: '#fff', borderRadius: 24 },
    hint: { color: '#fff', marginTop: 24, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, overflow: 'hidden' },
});
