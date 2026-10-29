export function money(value) {
    return '৳' + Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function date(value) {
    return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
