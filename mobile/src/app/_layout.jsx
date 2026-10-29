import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../lib/auth';
import { CartProvider } from '../lib/cart';
import { colors } from '../lib/theme';

export default function RootLayout() {
    return (
        <AuthProvider>
            <CartProvider>
                <StatusBar style="light" />
                <Stack
                    screenOptions={{
                        headerStyle: { backgroundColor: colors.brand },
                        headerTintColor: '#fff',
                        headerTitleStyle: { fontWeight: '700' },
                        contentStyle: { backgroundColor: colors.bg },
                    }}
                >
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="product/[slug]" options={{ title: 'Product' }} />
                    <Stack.Screen name="login" options={{ title: 'Log in', presentation: 'modal' }} />
                    <Stack.Screen name="register" options={{ title: 'Create account', presentation: 'modal' }} />
                    <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
                    <Stack.Screen name="orders/index" options={{ title: 'My orders' }} />
                    <Stack.Screen name="orders/[id]" options={{ title: 'Order details' }} />
                    <Stack.Screen name="affiliate/index" options={{ title: 'Affiliate dashboard' }} />
                    <Stack.Screen name="admin/index" options={{ title: 'Admin' }} />
                    <Stack.Screen name="admin/vendors" options={{ title: 'Vendors' }} />
                    <Stack.Screen name="admin/affiliates" options={{ title: 'Affiliates' }} />
                    <Stack.Screen name="admin/orders" options={{ title: 'All orders' }} />
                    <Stack.Screen name="admin/payouts" options={{ title: 'Payouts' }} />
                </Stack>
            </CartProvider>
        </AuthProvider>
    );
}
