import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import { useCart } from '../../lib/cart';
import { colors } from '../../lib/theme';

const icon = (name) => ({ color, size }) => <Ionicons name={name} color={color} size={size} />;

export default function TabsLayout() {
    const { count } = useCart();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.brand,
                headerStyle: { backgroundColor: colors.brand },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: '700' },
            }}
        >
            <Tabs.Screen name="index" options={{ title: 'HaatBazar', tabBarLabel: 'Home', tabBarIcon: icon('home-outline') }} />
            <Tabs.Screen name="scan" options={{ title: 'Scan QR', tabBarLabel: 'Scan', tabBarIcon: icon('qr-code-outline') }} />
            <Tabs.Screen name="cart" options={{ title: 'Cart', tabBarIcon: icon('cart-outline'), tabBarBadge: count || undefined }} />
            <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: icon('person-outline') }} />
        </Tabs>
    );
}
