import { Head } from '@inertiajs/react';

const messages = {
    403: ['Access denied', 'You do not have permission to view this page.'],
    404: ['Page not found', 'The page you are looking for does not exist or has been removed.'],
    500: ['Server error', 'Something went wrong on our end. Please try again.'],
    503: ['Service unavailable', 'We are doing some maintenance. Please check back soon.'],
};

export default function Error({ status }) {
    const [title, description] = messages[status] || messages[500];

    return (
        // Rendered without the shop layout: shared props may be missing for unmatched routes.
        <div className="flex min-h-screen items-center justify-center p-4">
            <Head title={title} />
            <div className="card w-full max-w-lg p-12 text-center">
                <div className="text-6xl font-bold text-brand-600">{status}</div>
                <h1 className="mt-4 text-2xl font-bold">{title}</h1>
                <p className="mt-2 text-slate-500">{description}</p>
                <a href="/" className="btn-primary mt-6">
                    Back to home
                </a>
            </div>
        </div>
    );
}
