import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { TextField } from '@mui/material';
import { Language } from '@mui/icons-material';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
    const { signIn, signUp } = useAuth();
    const { t, lang, toggleLang } = useTranslation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isRegistering) {
                await signUp(email, password);
            } else {
                await signIn(email, password);
            }
        } catch (err: any) {
            setError(t('login.errorAuth') || err.message);
        }
    };

    return (
        <div className="login-container">

            <div className="lang-button-container">
                <button onClick={toggleLang} className="lang-button">
                    <Language fontSize="small" />
                    {lang === 'pt' ? '🇧🇷 Português' : '🇺🇸 English'}
                </button>
            </div>

            {/* Coluna Esquerda */}
            <div className="left-column">
                <div className="left-content">
                    <div className="kiwi-icon">🥝</div>
                    <h2 className="brand-title">{t('login.brandTitle')}</h2>
                    <p className="brand-description">{t('login.description')}</p>
                </div>
            </div>

            {/* Coluna Direita */}
            <div className="right-column">
                <div className="form-wrapper">

                    <div className="header-titles">
                        <h1 className="main-title">{t('login.title')}</h1>
                        <p className="sub-title">{t('login.subtitle')}</p>
                    </div>

                    <div className="tabs-container">
                        <button
                            type="button"
                            onClick={() => setIsRegistering(false)}
                            className={`tab-button ${!isRegistering ? 'active' : 'inactive'}`}
                        >
                            {t('login.tabLogin')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsRegistering(true)}
                            className={`tab-button ${isRegistering ? 'active' : 'inactive'}`}
                        >
                            {t('login.tabRegister')}
                        </button>
                    </div>

                    {error && <div className="error-box">{error}</div>}

                    <form onSubmit={handleSubmit} className="form-content">
                        <TextField
                            type="email"
                            placeholder={t('login.emailPlaceholder')}
                            fullWidth
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            variant="outlined"
                            className="kiwi-text-field"
                        />

                        <TextField
                            type="password"
                            placeholder={t('login.passwordPlaceholder')}
                            fullWidth
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            variant="outlined"
                            className="kiwi-text-field"
                        />

                        <div className="form-actions">
                            <button type="submit" className="kiwi-submit-button">
                                {isRegistering ? t('login.registerButton') : t('login.loginButton')}
                            </button>

                            {!isRegistering && (
                                <a href="#forgot" onClick={(e) => e.preventDefault()} className="forgot-password">
                                    {t('login.forgotPassword')}
                                </a>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};