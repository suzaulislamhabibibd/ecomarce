import * as SecureStore from 'expo-secure-store';
import { createContext, createElement, useCallback, useContext, useEffect, useState } from 'react';
import { api, setAuthToken } from './api';

const TOKEN_KEY = 'hb_token';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const token = await SecureStore.getItemAsync(TOKEN_KEY);
                if (token) {
                    setAuthToken(token);
                    const { user } = await api('/auth/me');
                    setUser(user);
                }
            } catch {
                // Expired or revoked token: start logged out.
                setAuthToken(null);
                await SecureStore.deleteItemAsync(TOKEN_KEY);
            } finally {
                setReady(true);
            }
        })();
    }, []);

    const saveSession = useCallback(async ({ token, user }) => {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        setAuthToken(token);
        setUser(user);
        return user;
    }, []);

    const login = useCallback(
        (email, password) => api('/auth/login', { method: 'POST', body: { email, password, device_name: 'android' } }).then(saveSession),
        [saveSession],
    );

    const register = useCallback((fields) => api('/auth/register', { method: 'POST', body: { ...fields, device_name: 'android' } }).then(saveSession), [saveSession]);

    const logout = useCallback(async () => {
        try {
            await api('/auth/logout', { method: 'POST' });
        } catch {
            // Log out locally even if the server is unreachable.
        }
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setAuthToken(null);
        setUser(null);
    }, []);

    const refresh = useCallback(async () => setUser((await api('/auth/me')).user), []);

    return createElement(AuthContext.Provider, { value: { user, ready, login, register, logout, refresh } }, children);
}

export const useAuth = () => useContext(AuthContext);
