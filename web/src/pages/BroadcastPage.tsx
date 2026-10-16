import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { Button, TextField, MenuItem, Paper, Typography, Checkbox, ListItemText } from '@mui/material';
import { Send, Edit, Delete } from '@mui/icons-material';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '../services/dataService';

interface Message {
    id: string;
    connectionId: string;
    contactIds: string[];
    content: string;
    scheduledFor?: string;
    status: 'sent' | 'scheduled';
}
interface Connection { id: string; name: string; }
interface Contact { id: string; connectionId: string; name: string; phone: string; }

export const BroadcastPage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    const [messages, setMessages] = useState<Message[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);

    // Form States
    const [selectedConn, setSelectedConn] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [content, setContent] = useState('');
    const [scheduledFor, setScheduledFor] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    // Filter State ('all' | 'sent' | 'scheduled')
    const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'scheduled'>('all');

    // Carregamento Híbrido Mágico!
    useEffect(() => {
        if (!user) return;
        const unsubConn = subscribeToCollection('connections', user.uid, setConnections);
        const unsubCont = subscribeToCollection('contacts', user.uid, setContacts);
        const unsubMsg = subscribeToCollection('broadcasts', user.uid, setMessages);

        return () => { unsubConn(); unsubCont(); unsubMsg(); };
    }, [user]);

    // Filtra os contatos de acordo com a conexão selecionada
    const availableContacts = contacts.filter(c => c.connectionId === selectedConn);

    const handleSaveBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedConn || selectedContacts.length === 0 || !content.trim()) return;

        const status = scheduledFor ? 'scheduled' : 'sent';

        if (editingId) {
            await updateDocument('broadcasts', editingId, {
                connectionId: selectedConn,
                contactIds: selectedContacts,
                content: content,
                scheduledFor: scheduledFor,
                status,
            });
            setEditingId(null);
        } else {
            await addDocument('broadcasts', {
                clientId: user.uid,
                connectionId: selectedConn,
                contactIds: selectedContacts,
                content: content,
                scheduledFor: scheduledFor,
                status,
            });
        }

        // Limpa os campos imediatamente
        setContent('');
        setScheduledFor('');
        setSelectedConn('');
        setSelectedContacts([]);
    };

    const handleDelete = async (id: string) => {
        await deleteDocument('broadcasts', id);
    };

    // Mensagens filtradas pelo status selecionado
    const filteredMessages = messages.filter(msg => {
        if (filterStatus === 'sent') return msg.status === 'sent';
        if (filterStatus === 'scheduled') return msg.status === 'scheduled';
        return true;
    });

    return (
        <div className="dashboard-content">
            <div className="dashboard-grid">

                {/* Criar / Editar Broadcast com Múltiplos Contatos */}
                <Paper elevation={0} className="kiwi-card">
                    <div className="card-header">
                        <Send className="card-icon" />
                        <Typography variant="h6" className="card-title-text">{t('broadcast.newTitle')}</Typography>
                    </div>

                    <form onSubmit={handleSaveBroadcast} className="card-form">
                        <TextField
                            select
                            label={t('broadcast.selectConnection')}
                            fullWidth
                            required
                            value={selectedConn}
                            onChange={(e) => {
                                setSelectedConn(e.target.value);
                                setSelectedContacts([]); // Reseta os contatos ao mudar de conexão
                            }}
                            className="kiwi-input"
                        >
                            <MenuItem value=""><em>{t('broadcast.selectPlaceholder')}</em></MenuItem>
                            {connections.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                        </TextField>

                        {/* Seleção Múltipla de Contatos */}
                        <TextField
                            select
                            label="Selecionar Contatos"
                            fullWidth
                            required
                            value={selectedContacts}
                            onChange={(e) => setSelectedContacts(e.target.value as unknown as string[])}
                            slotProps={{
                                select: {
                                    multiple: true,
                                    renderValue: (selected) => {
                                        const names = (selected as string[]).map(id => contacts.find(c => c.id === id)?.name).filter(Boolean);
                                        return names.join(', ');
                                    }
                                }
                            }}
                            disabled={!selectedConn}
                            className="kiwi-input"
                        >
                            {availableContacts.map(contact => (
                                <MenuItem key={contact.id} value={contact.id}>
                                    <Checkbox checked={selectedContacts.indexOf(contact.id) > -1} />
                                    <ListItemText primary={`${contact.name} (${contact.phone})`} />
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label={t('broadcast.contentPlaceholder')}
                            multiline
                            rows={3}
                            fullWidth
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="kiwi-input"
                        />

                        <TextField
                            type="datetime-local"
                            label={t('broadcast.scheduleLabel')}
                            variant="outlined"
                            fullWidth
                            slotProps={{ inputLabel: { shrink: true } }}
                            value={scheduledFor}
                            onChange={(e) => setScheduledFor(e.target.value)}
                            className="kiwi-input"
                        />
                        <Button type="submit" variant="contained" fullWidth className="kiwi-action-button">
                            {editingId ? t('broadcast.updateMessage') : t('broadcast.sendNow')}
                        </Button>
                    </form>
                </Paper>

                {/* Histórico com Filtros de Mensagens */}
                <Paper elevation={0} className="kiwi-card">
                    <div className="card-header" style={{ justifyContent: 'space-between' }}>
                        <Typography variant="h6" className="card-title-text">{t('broadcast.historyTitle')}</Typography>

                        {/* Botões de Filtro */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <Button size="small" variant={filterStatus === 'all' ? 'contained' : 'outlined'} onClick={() => setFilterStatus('all')} style={{ fontSize: '0.7rem' }}>Todas</Button>
                            <Button size="small" variant={filterStatus === 'sent' ? 'contained' : 'outlined'} onClick={() => setFilterStatus('sent')} style={{ fontSize: '0.7rem' }}>Enviadas</Button>
                            <Button size="small" variant={filterStatus === 'scheduled' ? 'contained' : 'outlined'} onClick={() => setFilterStatus('scheduled')} style={{ fontSize: '0.7rem' }}>Agendadas</Button>
                        </div>
                    </div>

                    <div className="items-list">
                        {filteredMessages.map(msg => (
                            <div key={msg.id} className="item-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <p className="item-name" style={{ margin: 0 }}>{msg.content}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: msg.status === 'sent' ? '#7ab536' : '#f59e0b', fontWeight: 600 }}>
                                        {msg.status === 'sent' ? 'Enviado' : `Agendado para: ${msg.scheduledFor}`}
                                    </span>
                                    <div className="item-actions">
                                        <Button size="small" onClick={() => {
                                            setEditingId(msg.id);
                                            setSelectedConn(msg.connectionId);
                                            setSelectedContacts(msg.contactIds || []);
                                            setContent(msg.content);
                                            setScheduledFor(msg.scheduledFor || '');
                                        }}><Edit fontSize="small" /></Button>
                                        <Button size="small" color="error" onClick={() => handleDelete(msg.id)}><Delete fontSize="small" /></Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredMessages.length === 0 && <p className="empty-list-text">{t('broadcast.empty')}</p>}
                    </div>
                </Paper>

            </div>
        </div>
    );
};