


import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { user_api_key } from './util';
import io from 'socket.io-client';

function ChatModel({ userId, otherUser, onClose }) {
  const otherUserId = otherUser?._id || otherUser?.id;
  if (!otherUser || !otherUserId) {
    return <div style={{ padding: 20, color: 'red' }}>Invalid chat user. Please close and try again.</div>;
  }
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch chat history on mount
  useEffect(() => {
    if (!userId || !otherUserId) return;
    axios.get(`${user_api_key}/messages/${userId}/${otherUserId}`)
      .then(res => setMessages(res.data.messages || []))
      .catch(() => setMessages([]));
  }, [userId, otherUserId]);

  // Setup socket connection
  useEffect(() => {
    socketRef.current = io('http://localhost:3000');
    console.log('[ChatModel] Connecting socket for userId:', userId);
    socketRef.current.emit('identify', userId);
    socketRef.current.on('message', (msg) => {
      console.log('[ChatModel] Received message event:', msg);
      // Only add if relevant to this chat
      if (
        (msg.senderId === userId && msg.receiverId === otherUserId) ||
        (msg.senderId === otherUserId && msg.receiverId === userId)
      ) {
        setMessages(prev => [...prev, msg]);
      }
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, [userId, otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const msg = {
      senderId: userId,
      receiverId: otherUserId,
      content: trimmed,
    };
    try {
      console.log('[ChatModel] Sending message:', msg);
      socketRef.current.emit('message', msg);
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div style={{ width: 350, height: 500, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0002', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 12, borderBottom: '1px solid #eee', background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 500 }}>Chat with {otherUser?.name || 'Recruiter'}</span>
        {onClose && <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#888', lineHeight: 1 }} aria-label="Close chat">&times;</button>}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, background: '#fafbfc' }}>
        {messages.length === 0 && <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>No messages yet</div>}
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: userId === msg.senderId ? 'row-reverse' : 'row',
            marginBottom: 10,
            alignItems: 'flex-end',
          }}>
            <div style={{
              background: userId === msg.senderId ? '#007bff' : '#e9ecef',
              color: userId === msg.senderId ? '#fff' : '#222',
              borderRadius: 16,
              padding: '8px 14px',
              maxWidth: 220,
              wordBreak: 'break-word',
              fontSize: 15,
              boxShadow: userId === msg.senderId ? '0 1px 4px #007bff22' : '0 1px 4px #0001',
              position: 'relative',
            }}>
              <div>{msg.content}</div>
              <div style={{ fontSize: 11, color: '#bbb', marginTop: 2, textAlign: userId === msg.senderId ? 'right' : 'left' }}>
                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', borderTop: '1px solid #eee', background: '#f7f7f7', padding: 8 }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, border: 'none', outline: 'none', padding: 8, borderRadius: 4, fontSize: 15, background: '#fff' }}
          aria-label="Type a message"
        />
        <button type="submit" style={{ marginLeft: 8, background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }} aria-label="Send message">
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatModel;
