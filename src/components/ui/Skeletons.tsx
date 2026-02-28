export function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="skeleton h-8 w-64" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="card border-l-4 border-l-white/5 p-5 relative overflow-hidden">
                        <div className="skeleton-shimmer absolute inset-0 rounded-2xl" />
                        <div className="skeleton h-2.5 w-20 mb-4" />
                        <div className="skeleton h-7 w-28 mb-2" />
                        <div className="skeleton h-2 w-14" />
                    </div>
                ))}
            </div>
            <div className="card p-6">
                <div className="skeleton h-4 w-40 mb-6" />
                <div className="skeleton h-48 w-full" />
            </div>
        </div>
    )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-2 p-4">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                    <div className="skeleton h-4 w-20" />
                    <div className="skeleton h-4 w-32 flex-1" />
                    <div className="skeleton h-4 w-16" />
                    <div className="skeleton h-6 w-14 rounded-full" />
                </div>
            ))}
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div className="card p-5 relative overflow-hidden">
            <div className="skeleton-shimmer absolute inset-0 rounded-2xl" />
            <div className="skeleton h-3 w-24 mb-4" />
            <div className="skeleton h-6 w-full mb-3" />
            <div className="skeleton h-3 w-16" />
        </div>
    )
}
