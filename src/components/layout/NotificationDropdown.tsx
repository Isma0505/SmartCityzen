'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useStore } from '@/store/useStore';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  reportId: string | null;
  createdAt: string;
}

export default function NotificationDropdown() {
  const {
    user,
    unreadCount,
    setUnreadCount,
    navigateTo,
    setSelectedReportId,
  } = useStore();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  async function loadNotifications() {
    if (!user) return;

    const res = await fetch(`/api/notifications?userId=${user.id}`);

    if (!res.ok) return;

    const data = await res.json();

    setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    if (typeof data.unreadCount === 'number') {
      setUnreadCount(data.unreadCount);
    }
  }

  async function markAllRead() {
    if (notifications.length === 0) return;

    const unread = notifications
      .filter((n) => !n.read)
      .map((n) => n.id);

    if (unread.length === 0) return;

    await fetch('/api/notifications', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationIds: unread,
      }),
    });

    setUnreadCount(0);

    loadNotifications();
  }

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      await loadNotifications();
    };

    fetchData();
  }, [user]);

  return (
    <Popover
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (value) {
          loadNotifications();
          markAllRead();
        }
      }}
    >
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-md hover:bg-gray-100">
          <Bell className="size-5" />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-96 p-0"
      >

          {/* Header */}
          <div className="flex items-center justify-between border-b p-3">
              <h3 className="font-semibold">
                  Notifikasi
              </h3>

              <span className="text-xs text-gray-500">
                  {notifications.length} notifikasi
              </span>
          </div>

          {/* List Notification */}
          <div className="max-h-96 overflow-y-auto">

              {notifications.length === 0 && (
                  <p className="text-center text-gray-500 py-6">
                      Belum ada notifikasi
                  </p>
              )}

              {notifications.map((item) => (

                  <div
                      key={item.id}
                      onClick={() => {
                          if (item.reportId) {
                              setSelectedReportId(item.reportId);
                              navigateTo("report-detail");
                              setOpen(false);
                          }
                      }}
                      className={`border-b p-3 cursor-pointer hover:bg-gray-50 ${
                          !item.read ? "bg-emerald-50" : ""
                      }`}
                  >
                      <p className="text-sm">
                          {item.message}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.createdAt).toLocaleString("id-ID")}
                      </p>

                  </div>

              ))}

          </div>

      </PopoverContent>
    </Popover>
  );
}