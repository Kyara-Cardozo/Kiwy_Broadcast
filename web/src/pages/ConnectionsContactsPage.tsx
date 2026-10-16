import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Button, TextField, MenuItem, Paper, Typography } from '@mui/material';
import { Devices, PersonAdd, Edit, Delete } from '@mui/icons-material';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '../services/dataService';
import { useTranslation } from '../hooks/useTranslation';

interface Connection { id: string; name: string; }
interface Contact { id: string; connectionId: string; name: string; phone: string; }

export const ConnectionsContactsPage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    const [connections, setConnections] = useState<Connection[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);

    const [connName, setConnName] = useState('');
    const [editingConnId, setEditingConnId] = useState<string | null>(null);

    const [selectedConnId, setSelectedConnId] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [editingContactId, setEditingContactId] = useState<string | null>(null);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ''); 
        if (value.length > 11) value = value.slice(0, 11);

        if (value.length > 6) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length > 0) {
            value = `(${value}`;
        }
        setContactPhone(value);
    };

    // Carregamento Híbrido Mágico!
    useEffect(() => {
        if (!user) return;
        const unsubConn = subscribeToCollection('connections', user.uid, setConnections);
        const unsubCont = subscribeToCollection('contacts', user.uid, setContacts);
        
        return () => { unsubConn(); unsubCont(); };
    }, [user]);

    const handleSaveConnection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !connName.trim()) return;

        const nameToSave = connName;
        setConnName('');

        if (editingConnId) {
            await updateDocument('connections', editingConnId, { name: nameToSave });
            setEditingConnId(null);
        } else {
            await addDocument('connections', { clientId: user.uid, name: nameToSave });
        }
    };

    const handleSaveContact = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedConnId || !contactName.trim() || !contactPhone.trim()) return;

        if (editingContactId) {
            await updateDocument('contacts', editingContactId, {
                connectionId: selectedConnId,
                name: contactName,
                phone: contactPhone,
            });
            setEditingContactId(null);
        } else {
            await addDocument('contacts', {
                clientId: user.uid,
                connectionId: selectedConnId,
                name: contactName,
                phone: contactPhone,
            });
        }
        setContactName('');
        setContactPhone('');
        setSelectedConnId('');
    };

    const handleDeleteConnection = async (id: string) => {
        await deleteDocument('connections', id);
    };

    const handleDeleteContact = async (id: string) => {
        await deleteDocument('contacts', id);
    };

    return (
        <div className="dashboard-content">
            <div className="dashboard-grid">

                {/* Seção de Conexões */}
                <Paper elevation={0} className="kiwi-card">
                    <div className="card-header">
                        <Devices className="card-icon" />
                        <Typography variant="h6" className="card-title-text">{t('connections.title')}</Typography>
                    </div>

                    <form onSubmit={handleSaveConnection} className="card-form">
                        <TextField
                            label={t('connections.namePlaceholder')}
                            fullWidth
                            required
                            value={connName}
                            onChange={(e) => setConnName(e.target.value)}
                            className="kiwi-input"
                        />
                        <Button type="submit" variant="contained" fullWidth className="kiwi-action-button">
                            {editingConnId ? t('connections.updateButton') : t('connections.addButton')}
                        </Button>
                    </form>

                    <div className="items-list">
                        {connections.map(conn => (
                            <div key={conn.id} className="item-row">
                                <span className="item-name">{conn.name}</span>
                                <div className="item-actions">
                                    <Button size="small" onClick={() => { setEditingConnId(conn.id); setConnName(conn.name); }}><Edit fontSize="small" /></Button>
                                    <Button size="small" color="error" onClick={() => handleDeleteConnection(conn.id)}><Delete fontSize="small" /></Button>
                                </div>
                            </div>
                        ))}
                        {connections.length === 0 && <p className="empty-list-text">{t('connections.empty')}</p>}
                    </div>
                </Paper>

                {/* Seção de Contatos */}
                <Paper elevation={0} className="kiwi-card">
                    <div className="card-header">
                        <PersonAdd className="card-icon" />
                        <Typography variant="h6" className="card-title-text">{t('contacts.title')}</Typography>
                    </div>

                    <form onSubmit={handleSaveContact} className="card-form">
                        <TextField
                            select
                            label={t('contacts.selectConnection')}
                            fullWidth
                            required
                            value={selectedConnId}
                            onChange={(e) => setSelectedConnId(e.target.value)}
                            className="kiwi-input"
                        >
                            <MenuItem value="">
                                <em>{t('contacts.selectPlaceholder')}</em>
                            </MenuItem>
                            {connections.map(conn => (
                                <MenuItem key={conn.id} value={conn.id}>{conn.name}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label={t('contacts.namePlaceholder')}
                            fullWidth
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="kiwi-input"
                        />
                        <TextField
                            label={t('contacts.phonePlaceholder')}
                            fullWidth
                            required
                            placeholder="(00) 00000-0000"
                            value={contactPhone}
                            onChange={handlePhoneChange}
                            className="kiwi-input"
                        />
                        <Button type="submit" variant="contained" fullWidth className="kiwi-action-button">
                            {editingContactId ? t('contacts.updateButton') : t('contacts.addButton')}
                        </Button>
                    </form>

                    <div className="items-list">
                        {contacts.map(contact => {
                            const conn = connections.find(c => c.id === contact.connectionId);
                            return (
                                <div key={contact.id} className="item-row">
                                    <div>
                                        <p className="contact-main-text">{contact.name} <span className="contact-phone">({contact.phone})</span></p>
                                        <p className="contact-conn-label">{t('contacts.connectionLabel')} {conn?.name || 'Geral'}</p>
                                    </div>
                                    <div className="item-actions">
                                        <Button size="small" onClick={() => {
                                            setEditingContactId(contact.id);
                                            setSelectedConnId(contact.connectionId);
                                            setContactName(contact.name);
                                            setContactPhone(contact.phone);
                                        }}><Edit fontSize="small" /></Button>
                                        <Button size="small" color="error" onClick={() => handleDeleteContact(contact.id)}><Delete fontSize="small" /></Button>
                                    </div>
                                </div>
                            );
                        })}
                        {contacts.length === 0 && <p className="empty-list-text">{t('contacts.empty')}</p>}
                    </div>
                </Paper>

            </div>
        </div>
    );
};