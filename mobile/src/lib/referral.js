import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import { WEB_HOSTS } from './config';

const KEY = 'hb_ref';
const DAYS = 30;

/**
 * Parse a scanned QR value. Accepts website product links
 * (https://haatbazar.com/product/slug?ref=CODE) and app links
 * (haatbazar://product/slug). Returns null for anything else.
 */
export function parseProductLink(value) {
    const match = /^(https?):\/\/([^/?#]+)(\/[^?#]*)?(\?[^#]*)?/i.exec((value || '').trim());
    const appMatch = /^haatbazar:\/\/(\/?[^?#]*)(\?[^#]*)?/i.exec((value || '').trim());

    let host = null;
    let path;
    let search;
    if (match) {
        host = match[2].toLowerCase();
        path = match[3] || '/';
        search = match[4] || '';
        if (!WEB_HOSTS.includes(host)) return null;
    } else if (appMatch) {
        path = '/' + appMatch[1].replace(/^\//, '');
        search = appMatch[2] || '';
    } else {
        return null;
    }

    const slug = /^\/product\/([^/]+)\/?$/.exec(path)?.[1];
    if (!slug) return null;

    const params = Object.fromEntries(
        search
            .replace(/^\?/, '')
            .split('&')
            .filter(Boolean)
            .map((pair) => pair.split('=').map((s) => decodeURIComponent(s.replace(/\+/g, ' ')))),
    );

    return { slug: decodeURIComponent(slug), ref: params.ref || null };
}

/** Validate a referral code with the server, record the click and remember it. */
export async function captureReferral(ref, productSlug, source = 'app') {
    if (!ref) return;
    try {
        const res = await api('/referrals/click', { method: 'POST', body: { ref, product_slug: productSlug, source } });
        if (res.valid) {
            await AsyncStorage.setItem(KEY, JSON.stringify({ code: res.code, expires: Date.now() + DAYS * 86400000 }));
        }
    } catch {
        // Referral tracking must never block shopping.
    }
}

export async function getReferral() {
    try {
        const saved = JSON.parse((await AsyncStorage.getItem(KEY)) || 'null');
        return saved && saved.expires > Date.now() ? saved.code : null;
    } catch {
        return null;
    }
}
