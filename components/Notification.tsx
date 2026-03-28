'use client';

import { useNotification } from '@/lib/store';
import { CheckCircle, AlertCircle, InfoIcon, X } from 'lucide-react';

export default function Notification() {
  const { message, type, hide } = useNotification();

  if (!message) return null;

  const bgColor = {
    success: 'bg-green-100',
    error: 'bg-red-100',
    info: 'bg-blue-100',
  }[type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: InfoIcon,
  }[type];

  return (
    <div className={`fixed top-4 right-4 ${bgColor} ${textColor} px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-sm z-50 animate-slideIn`}>
      <Icon size={20} />
      <span className="flex-1">{message}</span>
      <button
        onClick={hide}
        className="text-current opacity-70 hover:opacity-100"
      >
        <X size={18} />
      </button>
    </div>
  );
}
