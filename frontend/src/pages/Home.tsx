import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FileText, Eye, BarChart3 } from 'lucide-react';
import './Home.css';

export default function Home() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Load theme from localStorage
    useEffect(() => {
        const saved = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
        setTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);

        // Listen for theme changes
        const handleStorageChange = () => {
            const currentTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
            setTheme(currentTheme);
            document.documentElement.setAttribute('data-theme', currentTheme);
        };

        window.addEventListener('storage', handleStorageChange);

        // Also check periodically for theme changes (in case navbar changes it)
        const interval = setInterval(() => {
            const currentTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
            if (currentTheme !== theme) {
                setTheme(currentTheme);
                document.documentElement.setAttribute('data-theme', currentTheme);
            }
        }, 100);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [theme]);

    return (
        <div className="home-container">
            {/* Side Images */}
            <img src="/kiri-login.png" alt="" className="home-side-image left" />
            <img src="/kanan-login.png" alt="" className="home-side-image right" />

            {/* Cloud Images */}
            <img src="/cloud.png" alt="" className="home-cloud home-cloud-1" />
            <img src="/cloud.png" alt="" className="home-cloud home-cloud-2" />
            <img src="/cloud.png" alt="" className="home-cloud home-cloud-3" />
            <img src="/cloud.png" alt="" className="home-cloud home-cloud-4" />
            <img src="/cloud.png" alt="" className="home-cloud home-cloud-5" />
            <img src="/cloud.png" alt="" className="home-cloud home-cloud-6" />
            <img src="/cloud.png" alt="" className="home-cloud home-cloud-7" />
            <img src="/cloud.png" alt="" className="home-cloud home-cloud-8" />
            <img src="/cloud.png" alt="" className="home-cloud home-cloud-9" />
            <img src="/cloud.png" alt="" className="home-cloud home-cloud-10" />
            <img src="/cloud.png" alt="" className="home-cloud home-cloud-11" />
            <img src="/cloud.png" alt="" className="home-cloud home-cloud-12" />
            <img src="/cloud.png" alt="" className="home-cloud home-cloud-13" />
            <img src="/cloud.png" alt="" className="home-cloud home-cloud-14" />

            {/* Balloon/Airplane Images - Changes based on theme */}
            <img
                src={theme === 'light' ? "/peswat udara.png" : "/balon udara.png"}
                alt=""
                className="balloon-image balloon-left"
            />

            {/* Main Card */}
            <div className="home-card">
                <h1>Welcome to CampusReport</h1>
                <p>
                    Track, report, and resolve campus issues in real time. Submit reports, view analytics, and stay informed.
                </p>

                <div className="home-actions">
                    <Link to="/report" className="btn-home primary">
                        <FileText size={20} />
                        Submit a Report
                    </Link>
                    <Link to="/my-reports" className="btn-home secondary">
                        <Eye size={20} />
                        View My Reports
                    </Link>
                    <Link to="/dashboard" className="btn-home secondary">
                        <BarChart3 size={20} />
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
