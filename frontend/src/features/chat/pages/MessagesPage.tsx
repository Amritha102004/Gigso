import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { PaperClipIcon, PaperAirplaneIcon, InboxIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ChatRoom {
  gigId: string;
  gigTitle: string;
  counterpartyId: string;
  counterpartyName: string;
  counterpartyRole: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface MessageItem {
  _id: string;
  gigId: string;
  senderId: string;
  receiverId: string;
  message: string;
  attachments: string[];
  isRead: boolean;
  createdAt: string;
}

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const activeRoomRef = useRef<ChatRoom | null>(null);
  const processedParamsRef = useRef<string | null>(null);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  // Attachment states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchRooms = async (autoSelectId?: {
    gigId: string;
    counterpartyId: string;
    gigTitle: string;
    counterpartyName: string;
  }) => {
    try {
      const response = await apiClient.get('/chat/rooms');
      if (response.data && response.data.data) {
        const chatRooms = response.data.data.rooms as ChatRoom[];
        
        let finalRooms = [...chatRooms];
        const currentActive = activeRoomRef.current;

        // Preserve temporary room at the top of list if it is not saved to the DB yet
        if (currentActive && !autoSelectId) {
          const exists = chatRooms.some(
            (r) => r.gigId === currentActive.gigId && r.counterpartyId === currentActive.counterpartyId
          );
          if (!exists) {
            finalRooms = [currentActive, ...chatRooms];
          }
        }

        setRooms(finalRooms);

        // Auto select a room if query params are present
        if (autoSelectId) {
          const matched = chatRooms.find(
            (r) => r.gigId === autoSelectId.gigId && r.counterpartyId === autoSelectId.counterpartyId
          );
          if (matched) {
            setActiveRoom(matched);
          } else {
            // Temporary room for new conversation context (built directly from query string!)
            const tempRoom: ChatRoom = {
              gigId: autoSelectId.gigId,
              gigTitle: autoSelectId.gigTitle,
              counterpartyId: autoSelectId.counterpartyId,
              counterpartyName: autoSelectId.counterpartyName,
              counterpartyRole: user?.role === 'worker' ? 'owner' : 'worker',
              lastMessage: 'Start typing to begin conversation...',
              lastMessageAt: new Date().toISOString(),
              unreadCount: 0,
            };
            setRooms([tempRoom, ...chatRooms]);
            setActiveRoom(tempRoom);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    const gigIdParam = searchParams.get('gigId');
    const ownerIdParam = searchParams.get('ownerId');
    const workerIdParam = searchParams.get('workerId');
    const counterpartyId = ownerIdParam || workerIdParam;
    
    const gigTitleParam = searchParams.get('gigTitle') || 'Gig Chat';
    const counterpartyNameParam = searchParams.get('counterpartyName') || searchParams.get('ownerName') || searchParams.get('workerName') || 'Contact';

    if (gigIdParam && counterpartyId) {
      const paramKey = `${gigIdParam}-${counterpartyId}`;
      if (processedParamsRef.current !== paramKey) {
        processedParamsRef.current = paramKey;
        fetchRooms({
          gigId: gigIdParam,
          counterpartyId,
          gigTitle: gigTitleParam,
          counterpartyName: counterpartyNameParam
        });
      }
    } else {
      fetchRooms();
    }
  }, [searchParams]);

  // Polling for rooms and active room messages
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRooms();
      if (activeRoom) {
        fetchMessages(activeRoom.gigId, activeRoom.counterpartyId, false);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeRoom]);

  const fetchMessages = async (gigId: string, counterpartyId: string, showSpinner = true) => {
    if (showSpinner) setIsLoadingMessages(true);
    try {
      const response = await apiClient.get(`/chat/${gigId}/${counterpartyId}`);
      if (response.data && response.data.data) {
        setMessages(response.data.data.messages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (showSpinner) setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.gigId, activeRoom.counterpartyId, true);
    }
  }, [activeRoom]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile && !filePreview) return;
    if (!activeRoom) return;

    setIsUploading(true);
    let attachments: string[] = [];

    // Mock Upload or base64 attachments
    if (filePreview) {
      attachments.push(filePreview); // Directly append base64 image content for quick mock-uploading preview
    }

    try {
      const payload = {
        receiverId: activeRoom.counterpartyId,
        message: inputText.trim() || 'Sent an attachment',
        attachments,
      };

      const response = await apiClient.post(`/chat/${activeRoom.gigId}`, payload);
      if (response.data && response.data.data) {
        const newMsg = response.data.data.message;
        setMessages((prev) => [...prev, newMsg]);
        setInputText('');
        removeSelectedFile();
        fetchRooms();
      }
    } catch (err) {
      showToast('Failed to send message', 'error');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Left Chat List Panel */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-textMain">Conversations</h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {isLoadingRooms ? (
            <div className="p-8 text-center text-xs text-secondary animate-pulse">Loading rooms...</div>
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center text-xs text-secondary">No conversations yet.</div>
          ) : (
            rooms.map((room, idx) => {
              const isSelected = activeRoom?.gigId === room.gigId && activeRoom?.counterpartyId === room.counterpartyId;
              return (
                <div
                  key={`${room.gigId}-${room.counterpartyId}-${idx}`}
                  onClick={() => {
                    setActiveRoom(room);
                    setSearchParams({});
                  }}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-gray-50/50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="font-bold text-xs text-textMain truncate">{room.counterpartyName}</p>
                      <span className="text-[9px] text-gray-400">
                        {new Date(room.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[10px] text-secondary font-semibold uppercase tracking-wider mb-0.5 truncate">
                      {room.gigTitle}
                    </p>
                    <p className="text-[11px] text-secondary truncate">{room.lastMessage}</p>
                  </div>
                  {room.unreadCount > 0 && !isSelected && (
                    <span className="ml-2 w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Main Chat Frame */}
      <div className="flex-1 flex flex-col bg-gray-50/50 h-full">
        {activeRoom ? (
          <>
            {/* Chat Top bar */}
            <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 shadow-sm">
              <div className="min-w-0">
                <p className="font-bold text-sm text-textMain truncate">{activeRoom.counterpartyName}</p>
                <p className="text-[10px] text-secondary font-semibold uppercase tracking-wide truncate">
                  Regarding: {activeRoom.gigTitle}
                </p>
              </div>
            </div>

            {/* Messages Display Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingMessages ? (
                <div className="text-center text-xs text-secondary animate-pulse">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-xs text-secondary my-12">Send a message to start conversation.</div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.senderId === user?.id || msg.senderId === user?._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md rounded-2xl p-3 shadow-sm transition-all ${
                          isOwn
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-white text-textMain border border-gray-100 rounded-bl-none'
                        }`}
                      >
                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mb-2 max-w-[200px] rounded-lg overflow-hidden">
                            {msg.attachments.map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt="Attachment"
                                className="w-full object-cover rounded-lg shadow-inner cursor-pointer"
                                onClick={() => window.open(url, '_blank')}
                              />
                            ))}
                          </div>
                        )}
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        <span className={`text-[8px] mt-1 block text-right ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Panel */}
            <div className="p-4 bg-white border-t border-gray-100 shadow-lg relative shrink-0">
              {/* Attachment Preview Box */}
              {filePreview && (
                <div className="absolute bottom-full left-4 bg-white border border-gray-100 p-2 rounded-xl shadow-xl flex items-center gap-2 mb-2 z-10 animate-slideUp">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 border overflow-hidden flex items-center justify-center">
                    <img src={filePreview} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 max-w-[120px]">
                    <p className="text-[10px] font-bold text-textMain truncate">{selectedFile?.name || 'File'}</p>
                    <p className="text-[8px] text-secondary">
                      {selectedFile ? `${Math.round(selectedFile.size / 1024)} KB` : ''}
                    </p>
                  </div>
                  <button
                    onClick={removeSelectedFile}
                    className="p-1 hover:bg-gray-100 rounded-full text-red-500"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                {/* Paperclip Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-100 rounded-full text-secondary hover:text-primary transition-colors shrink-0"
                >
                  <PaperClipIcon className="w-5 h-5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-textMain outline-none focus:border-primary shadow-inner"
                />

                <button
                  type="submit"
                  disabled={isUploading}
                  className="p-2.5 bg-primary text-white rounded-full hover:bg-primary/95 transition-all shadow-md active:scale-95 disabled:opacity-50 shrink-0"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/20">
            <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-4">
              <InboxIcon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-textMain">Select a Conversation</h3>
            <p className="text-xs text-secondary mt-1">Select an active contact or inquire about a gig to begin chat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
