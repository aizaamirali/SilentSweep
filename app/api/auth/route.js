import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-24 text-center">
            <div className="mb-12">
                <h1 className="text-4xl sm:text-6xl font-bold mb-4">
                    SilentSweep EMMS
                </h1>
                <p className="text-xl sm:text-2xl opacity-80 max-w-2xl mx-auto">
                    Employee Management & Monitoring System
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full mb-12">
                <div className="border rounded-lg p-6 text-left hover:border-foreground/40 transition-colors">
                    <h2 className="text-2xl font-semibold mb-3">Employee Tracking</h2>
                    <p className="opacity-80">
                        Monitor attendance, performance metrics, and task progress in real-time.
                    </p>
                </div>

                <div className="border rounded-lg p-6 text-left hover:border-foreground/40 transition-colors">
                    <h2 className="text-2xl font-semibold mb-3">Task Management</h2>
                    <p className="opacity-80">
                        Assign, track, and manage tasks efficiently across your organization.
                    </p>
                </div>

                <div className="border rounded-lg p-6 text-left hover:border-foreground/40 transition-colors">
                    <h2 className="text-2xl font-semibold mb-3">Analytics Dashboard</h2>
                    <p className="opacity-80">
                        Comprehensive insights into workforce productivity and performance.
                    </p>
                </div>

                <div className="border rounded-lg p-6 text-left hover:border-foreground/40 transition-colors">
                    <h2 className="text-2xl font-semibold mb-3">AI-Driven Insights</h2>
                    <p className="opacity-80">
                        Advanced ML models to predict burnout, recommend tasks, and detect anomalies.
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/login"
                    className="bg-foreground text-background px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
                >
                    Login to System
                </Link>
                <Link
                    href="/about"
                    className="border border-foreground px-6 py-3 rounded-md hover:bg-foreground/10 transition-colors"
                >
                    Learn More
                </Link>
            </div>
        </main>
    );
}
