import Pagination from '../../Components/Pagination';
import ProductCard from '../../Components/ProductCard';
import ShopLayout from '../../Layouts/ShopLayout';

export default function StoreShow({ vendor, products }) {
    return (
        <ShopLayout title={vendor.shop_name}>
            <div className="card mb-6 flex flex-col gap-4 bg-gradient-to-r from-brand-50 to-white p-6 sm:flex-row sm:items-center">
                {vendor.logo_url ? (
                    <img src={vendor.logo_url} alt={vendor.shop_name} className="h-20 w-20 rounded-full object-cover" />
                ) : (
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-3xl font-bold text-white">
                        {vendor.shop_name.charAt(0)}
                    </span>
                )}
                <div>
                    <h1 className="text-2xl font-bold">{vendor.shop_name}</h1>
                    {vendor.description && <p className="mt-1 text-slate-600">{vendor.description}</p>}
                    <p className="mt-1 text-sm text-slate-500">
                        {vendor.address} {vendor.phone && `· ${vendor.phone}`}
                    </p>
                </div>
            </div>
            <h2 className="mb-4 text-lg font-semibold">{products.total} products</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {products.data.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <Pagination paginator={products} />
        </ShopLayout>
    );
}
