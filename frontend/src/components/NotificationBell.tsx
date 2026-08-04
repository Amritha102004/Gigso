import React, { useEffect, useState, useRef } from 'react';
import apiClient from '../api/client';
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications');
      if (response.data && response.data.data) {
        setNotifications(response.data.data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const displayedNotifications = activeTab === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors relative text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-md border border-gray-100 rounded-3xl shadow-xl z-50 p-5 space-y-4 transition-all duration-200 ease-out origin-top-right">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center rounded-2xl">
                <BellIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-textMain text-sm">Notification</h3>
                <p className="text-[11px] text-secondary mt-0.5">{unreadCount} unread notifications</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs & Mark All As Read */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('unread')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'unread'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-secondary hover:bg-gray-200'
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-bold ${
                    activeTab === 'unread' ? 'bg-white text-primary' : 'bg-primary text-white'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-secondary hover:bg-gray-200'
                }`}
              >
                All
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                title="Mark all as read"
                className="w-7 h-7 bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center rounded-full transition-colors active:scale-90"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* List of Notification cards */}
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            {displayedNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-secondary italic">
                {activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
              </div>
            ) : (
              displayedNotifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 border rounded-2xl flex flex-col gap-2 transition-all ${
                    n.isRead
                      ? 'bg-white border-gray-100'
                      : 'bg-primary/5 border-primary/20 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-xs font-bold truncate ${n.isRead ? 'text-textMain' : 'text-primary'}`}>
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <span className="w-2 h-2 bg-primary rounded-full shrink-0 animate-pulse" />
                      )}
                    </div>
                    <span className="text-[9px] text-gray-400 shrink-0">
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-secondary leading-normal whitespace-pre-wrap">
                    {n.message}
                  </p>
                  {!n.isRead && (
                    <div className="flex justify-end mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(n._id);
                        }}
                        className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/95 transition-all active:scale-95"
                      >
                        Mark as read
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
