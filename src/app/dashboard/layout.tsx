import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            <Sidebar />
            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                {/* Container for dashboard content */}
                <div className="max-w-7xl mx-auto space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
