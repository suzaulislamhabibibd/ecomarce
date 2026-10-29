export function Field({ label, error, children, hint }) {
    return (
        <label className="block">
            {label && <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>}
            {children}
            {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
            {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
        </label>
    );
}

export function TextInput({ label, error, hint, ...props }) {
    return (
        <Field label={label} error={error} hint={hint}>
            <input className="input" {...props} />
        </Field>
    );
}

export function TextArea({ label, error, hint, ...props }) {
    return (
        <Field label={label} error={error} hint={hint}>
            <textarea className="input" rows={4} {...props} />
        </Field>
    );
}

export function Select({ label, error, hint, children, ...props }) {
    return (
        <Field label={label} error={error} hint={hint}>
            <select className="input" {...props}>
                {children}
            </select>
        </Field>
    );
}
