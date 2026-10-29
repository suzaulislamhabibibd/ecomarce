import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Flash() {
    const { flash, errors } = usePage().props;
    const [visible, setVisible] = useState(true);
    const message = flash?.success || flash?.error || errors?.cart || errors?.order || errors?.status;
    const isError = !flash?.success;

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 5000);
        return () => clearTimeout(timer);
    }, [message]);

    if (!message || !visible) return null;

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
            <div
                role="status"
                className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
                    isError ? 'bg-rose-600 text-white' : 'bg-brand-700 text-white'
                }`}
            >
                <span className="flex-1">{message}</span>
                <button onClick={() => setVisible(false)} className="opacity-70 hover:opacity-100" aria-label="Dismiss">
                    ✕
                </button>
            </div>
        </div>
    );
}
