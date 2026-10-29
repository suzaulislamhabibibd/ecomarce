import { QRCodeSVG } from 'qrcode.react';
import { useRef, useState } from 'react';

/** QR code with copy-link and download actions. */
export default function QrCard({ value, title, caption, size = 160, fileName = 'qr-code' }) {
    const ref = useRef(null);
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            prompt('Copy this link', value);
        }
    };

    const download = () => {
        const svg = ref.current?.querySelector('svg');
        if (!svg) return;
        const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${fileName}.svg`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    return (
        <div className="flex flex-col items-center text-center">
            {title && <div className="mb-2 text-sm font-semibold">{title}</div>}
            <div ref={ref} className="rounded-lg bg-white p-2 ring-1 ring-slate-200">
                <QRCodeSVG value={value} size={size} level="M" marginSize={1} />
            </div>
            {caption && <p className="mt-2 max-w-48 text-xs text-slate-500">{caption}</p>}
            <div className="mt-2 flex gap-2 whitespace-nowrap">
                <button type="button" onClick={copy} className="btn-secondary btn-sm">
                    {copied ? 'Copied!' : 'Copy link'}
                </button>
                <button type="button" onClick={download} className="btn-secondary btn-sm">
                    Download
                </button>
            </div>
        </div>
    );
}
