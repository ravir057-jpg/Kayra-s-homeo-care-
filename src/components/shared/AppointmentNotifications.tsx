import React, { useState, useEffect } from "react";
import { Bell, X, Calendar, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/db";
import { Appointment } from "../../types";

export default function AppointmentNotifications() {
  const [notifications, setNotifications] = useState<Appointment[]>([]);

  useEffect(() => {
    const checkReminders = () => {
      const appointments = db.get<Appointment[]>('appointments') || [];
      const now = new Date();
      let updatedCount = 0;

      const updatedAppointments = appointments.map(app => {
        if (app.status !== 'Pending' || !app.reminderMinutes || app.isReminderSent) {
          return app;
        }

        const appDateTime = new Date(`${app.date}T${app.time}`);
        const reminderTime = new Date(appDateTime.getTime() - app.reminderMinutes * 60000);

        if (now >= reminderTime && now < appDateTime) {
          // Trigger reminder
          setNotifications(prev => [...prev, app]);
          updatedCount++;
          return { ...app, isReminderSent: true };
        }
        return app;
      });

      if (updatedCount > 0) {
        db.set('appointments', updatedAppointments);
      }
    };

    // Check immediately and then every minute
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200] space-y-4 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((app) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl shadow-2xl border-l-4 border-emerald-500 p-5 flex gap-4 pointer-events-auto"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6 text-emerald-600 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Upcoming Appointment</span>
                <button 
                  onClick={() => removeNotification(app.id)}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
              <h4 className="font-bold text-gray-900 leading-tight mb-1">{app.patientName}</h4>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{app.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{app.time}</span>
                </div>
              </div>
              <p className="mt-3 text-[10px] italic text-gray-400 flex items-center gap-1">
                <Bell className="w-2.5 h-2.5" />
                Reminder: {app.reminderMinutes} mins before
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
