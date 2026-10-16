import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useTranslation } from './hooks/useTranslation';
import { LoginPage } from './pages/LoginPage';
import { ConnectionsContactsPage } from './pages/ConnectionsContactsPage';
import { BroadcastPage } from './pages/BroadcastPage';
import { Devices, Send, Language } from '@mui/icons-material';
import './pages/ConnectionsContactsPage.css';

const MainApp: React.FC = () => {
    const { user, logout, loading } = useAuth();
    const { t, lang, toggleLang } = useTranslation();
    const [currentTab, setCurrentTab] = useState<'management' | 'broadcast'>('management');

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Poppins, sans-serif' }}>Carregando...</div>;
    }

    if (!user) {
        return <LoginPage />;
    }

    return (
        <div className="dashboard-container">
            <nav className="dashboard-navbar">
                <div className="nav-brand-container">
                    <span className="nav-brand-icon">🥝</span>
                    <span className="nav-brand-title">Kiwy Broadcast</span>
                </div>

                <div className="nav-menu">
                    <button
                        onClick={() => setCurrentTab('management')}
                        className={`nav-tab-button ${currentTab === 'management' ? 'active' : ''}`}
                    >
                        <Devices fontSize="small" />
                        {t('dashboard.connectionTab')}
                    </button>
                    <button
                        onClick={() => setCurrentTab('broadcast')}
                        className={`nav-tab-button ${currentTab === 'broadcast' ? 'active' : ''}`}
                    >
                        <Send fontSize="small" />
                        {t('dashboard.broadcastTab')}
                    </button>
                </div>

                <div className="nav-right-actions">
                    <button onClick={toggleLang} className="lang-button" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontFamily: 'Poppins, sans-serif' }}>
                        <Language fontSize="small" />
                        {lang === 'pt' ? '🇧🇷 Português' : '🇺🇸 English'}
                    </button>
                    <span className="user-email-badge">{user.email}</span>
                    <button onClick={logout} className="logout-btn">
                        {t('dashboard.logout')}
                    </button>
                </div>
            </nav>

            <main>
                {currentTab === 'management' ? <ConnectionsContactsPage /> : <BroadcastPage />}
            </main>
        </div>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    );
}