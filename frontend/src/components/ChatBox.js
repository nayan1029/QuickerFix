import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './ChatBox.css';

const ChatBox = ({ reportId, recipientId, recipientName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const socket = chatService.getSocket();
    if (!socket && user) {
      chatService.initializeSocket(user.id);
    }

    // Listen for incoming messages
    if (socket) {
      socket.on(`message-${reportId}`, (message) => {
        setMessages((prev) => [...prev, message]);
        chatService.markAsRead(message.id);
        scrollToBottom();
      });

      socket.on(`typing-${reportId}`, () => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      });
    }

    return () => {
      if (socket) {
        socket.off(`message-${reportId}`);
        socket.off(`typing-${reportId}`);
      }
    };
  }, [reportId, user]);

  const fetchMessages = async () => {
    try {
      const response = await chatService.getMessages(reportId);
      setMessages(response.data || []);
      chatService.markAllAsRead(reportId);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await chatService.sendMessage(reportId, recipientId, newMessage);
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
      scrollToBottom();

      // Emit typing event
      const socket = chatService.getSocket();
      if (socket) {
        socket.emit('typing', { reportId, userId: user.id });
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-box card">
      <div className="chat-header card-header bg-primary text-white">
        <h6 className="mb-0">💬 Chat with {recipientName}</h6>
      </div>

      <div className="chat-messages card-body">
        {messages.length === 0 ? (
          <div className="text-center text-muted">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message mb-2 ${msg.senderId === user.id ? 'sent' : 'received'}`}
            >
              <div className={`message-content alert ${msg.senderId === user.id ? 'alert-primary' : 'alert-secondary'}`}>
                <small className="d-block text-muted">{msg.senderName}</small>
                <p className="mb-1">{msg.content}</p>
                <small className="text-muted">{formatTime(msg.timestamp)}</small>
                {msg.isRead && msg.senderId !== user.id && (
                  <small className="d-block text-success">✓ Read</small>
                )}
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="typing-indicator">
            <small className="text-muted">
              {recipientName} is typing
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </small>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input card-footer">
        <form onSubmit={handleSendMessage} className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading || !newMessage.trim()}
          >
            {loading ? '📤' : '📨'} Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
