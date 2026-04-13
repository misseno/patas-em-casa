import React, { useEffect, useState } from 'react';
import { Bell, X, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert' | 'match';
  duration?: number;
}

interface NotificationToastProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

export function NotificationToast({ notifications, removeNotification }: NotificationToastProps) {
  return (
    <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-white rounded-[1.5rem] shadow-2xl border border-black/5 p-4 w-[320px] relative overflow-hidden group"
          >
            {/* Barra lateral de cor */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-1.5"
              style={{ 
                backgroundColor: n.type === 'match' ? '#CC5833' : 
                                 n.type === 'success' ? '#06D6A0' : 
                                 n.type === 'alert' ? '#ef4444' : '#2E4036' 
              }}
            />

            <div className="flex gap-3">
              <div className="mt-1">
                {n.type === 'match' && <Bell className="text-[#CC5833]" size={20} />}
                {n.type === 'success' && <CheckCircle2 className="text-[#06D6A0]" size={20} />}
                {n.type === 'alert' && <AlertCircle className="text-red-500" size={20} />}
                {n.type === 'info' && <Info className="text-[#2E4036]" size={20} />}
              </div>
              
              <div className="flex-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#1A1A1A] mb-1">
                  {n.title}
                </h4>
                <p className="text-xs text-[#1A1A1A]/60 leading-relaxed">
                  {n.message}
                </p>
              </div>

              <button 
                onClick={() => removeNotification(n.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/5 rounded-full h-fit"
              >
                <X size={14} className="opacity-40" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
