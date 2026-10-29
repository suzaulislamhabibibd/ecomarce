const palettes = [
    'from-emerald-200 to-teal-400',
    'from-amber-200 to-orange-400',
    'from-sky-200 to-indigo-400',
    'from-rose-200 to-pink-400',
    'from-lime-200 to-green-400',
    'from-violet-200 to-purple-400',
];

export default function ProductImage({ src, name, className = '' }) {
    if (src) {
        return <img src={src} alt={name} className={`h-full w-full object-cover ${className}`} loading="lazy" />;
    }
    const palette = palettes[(name || '').length % palettes.length];
    return (
        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${palette} ${className}`}>
            <span className="text-4xl font-bold text-white/90 drop-shadow">{(name || '?').charAt(0)}</span>
        </div>
    );
}
