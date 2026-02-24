import React, { useState, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Plus, Trash2, Mail, Home, UserPlus, User, LogOut, Edit, 
  BarChart3, Calendar, UserX, Smartphone, Copy, RefreshCw, 
  MessageCircle, Send, Zap, TrendingUp, TrendingDown, Activity, Settings, CreditCard
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AnnouncementManager from '@/components/announcements/AnnouncementManager';
import { HouseholdContext } from '../Layout';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UserSettings() {
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteHouseholdDialog, setShowDeleteHouseholdDialog] = useState(false);
  const [householdToDelete, setHouseholdToDelete] = useState(null);
  const [generatingCode, setGeneratingCode] = useState({});
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { user, households, setSelectedHouseholdId } = useContext(HouseholdContext);

  // שליפת סטטיסטיקות חכמות למנהל
  const { data: stats } = useQuery({
    queryKey: ['todayStats'],
    queryFn: async () => {
      if (!user || user.role !== 'admin') return null;
      const result = await base44.functions.invoke('getTodayStats');
      return result.data;
    },
    enabled: !!user && user.role === 'admin',
    refetchInterval: 30000, // רענון אוטומטי כל 30 שניות
  });

  const updateUserName = useMutation({
    mutationFn: async (fullName) => {
      return base44.auth.updateMe({ full_name: fullName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setIsEditingName(false);
      setNewFullName('');
    }
  });

  const createHousehold = useMutation({
    mutationFn: async (name) => {
      return base44.entities.Household.create({
        name,
        owner_email: user.email,
        members: [user.email]
      });
    },
    onSuccess: () => {
      setNewHouseholdName('');
      setShowCreateForm(false);
      navigate(createPageUrl('Dashboard'));
    }
  });

  const inviteMember = useMutation({
    mutationFn: async ({ householdId, email }) => {
      const household = households.find(h => h.id === householdId);
      const updatedMembers = [...(household.members || []), email];
      await base44.entities.Household.update(householdId, {
        members: updatedMembers
      });
      await base44.users.inviteUser(email, 'user');
    },
    onSuccess: () => {
      setInviteEmail('');
      alert('ההזמנה נשלחה בהצלחה! נא לבקש מהמוזמן לבדוק גם בתיקיית הספאם/דואר זבל.');
    }
  });

  const removeMember = useMutation({
    mutationFn: async ({ householdId, email }) => {
      const household = households.find(h => h.id === householdId);
      const updatedMembers = household.members.filter(m => m !== email);
      return base44.entities.Household.update(householdId, {
        members: updatedMembers
      });
    },
  });

  const deleteHousehold = useMutation({
    mutationFn: async (id) => {
      const now = new Date().toISOString();
      return base44.entities.Household.update(id, {
        is_deleted: true,
        deleted_at: now,
        whatsapp_numbers: []
      });
    },
    onSuccess: () => {
      setShowDeleteHouseholdDialog(false);
      setHouseholdToDelete(null);
    }
  });

  const handleCreateHousehold = (e) => {
    e.preventDefault();
    if (newHouseholdName.trim()) {
      createHousehold.mutate(newHouseholdName);
    }
  };

  const handleInvite = (householdId) => {
    if (inviteEmail.trim() && inviteEmail.includes('@')) {
      inviteMember.mutate({ householdId, email: inviteEmail });
    }
  };

  const handleUpdateName = (e) => {
    e.preventDefault();
    if (newFullName.trim()) {
      updateUserName.mutate(newFullName);
    }
  };

  const handleLogout = () => {
    base44.auth.logout(window.location.origin);
  };

  const handleDeleteAccount = async () => {
    const userHouseholds = households.filter(h => h.owner_email === user.email);
    for (const household of userHouseholds) {
      await base44.entities.Household.delete(household.id);
    }
    
    alert('נתוני המשתמש נמחקו. אנא פנה לתמיכה למחיקת החשבון המלאה.');
    base44.auth.logout();
  };

  // פונקציה מתוקנת - ללא alert ועם רענון נתונים
  const handleGenerateActivationCode = async (householdId) => {
    setGeneratingCode({ ...generatingCode, [householdId]: true });
    await base44.functions.invoke('generateActivationCode', { household_id: householdId });
    
    // רענון השאילתות כדי להציג את הקוד החדש ישר בממשק
    queryClient.invalidateQueries({ queryKey: ['userHouseholds'] });
    setGeneratingCode({ ...generatingCode, [householdId]: false });
    
    // רענון דף קטן כדי להבטיח שהנתונים ב-Context התעדכנו
    window.location.reload();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // אפשר להשאיר את ה-alert הזה כי הוא קצר ומאשר פעולת העתקה
    alert('הקוד הועתק ללוח');
  };

  const handleWhatsAppConnect = async (household) => {
    let code = household.activation_code;
    let expiresAt = household.activation_code_expires;
    
    const isExpired = expiresAt && new Date(expiresAt) < new Date();
    
    if (!code || isExpired) {
      const response = await base44.functions.invoke('generateActivationCode', {
        household_id: household.id
      });
      code = response.data.activation_code;
    }
    
    const systemConfig = await base44.entities.SystemConfig.list();
    const whatsappBotNumberItem = systemConfig?.find(config => config.key === 'whatsapp_bot_number');
    const whatsappNumber = whatsappBotNumberItem?.value || '972559725996';
    
    const message = encodeURIComponent(code);
    const url = `https://api.whatsapp.com/send/?phone=${whatsappNumber}&text=${message}&type=phone_number&app_absent=0`;
    window.open(url, '_blank');
  };

  const handleTelegramConnect = async (household) => {
    let code = household.activation_code;
    let expiresAt = household.activation_code_expires;
    
    const isExpired = expiresAt && new Date(expiresAt) < new Date();
    
    if (!code || isExpired) {
      const response = await base44.functions.invoke('generateActivationCode', {
        household_id: household.id
      });
      code = response.data.activation_code;
    }
    
    const systemConfig = await base44.entities.SystemConfig.list();
    const telegramBotUsernameItem = systemConfig?.find(config => config.key === 'telegram_bot_username');
    const botUsername = telegramBotUsernameItem?.value || 'controlyourmoneyy_bot';
    
    const message = encodeURIComponent(`אשמח להפעיל את חשבון הטלגרם שלי עבור ניהול תקציב, קוד הפעלה: ${code}`);
    const url = `https://t.me/${botUsername}?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-gray-950 p-4 md:p-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* כותרת דף */}
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            הגדרות וניהול
          </h1>
        </div>

        {/* --- דשבורד מנהל חכם --- */}
        {user?.role === 'admin' && stats && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-none shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-6">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xl font-bold">
                    <Zap className="w-6 h-6 text-yellow-300" />
                    דופק מערכת בזמן אמת
                  </div>
                  <Badge className="bg-white/20 text-white border-none px-3 py-1">LIVE</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* מדדי פעילות (Pulse) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800">
                    <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1">פעולות היום</p>
                    <p className="text-3xl font-black text-orange-700 dark:text-orange-300">{stats.summary.totalEntriesToday}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">משתמשים פעילים</p>
                    <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{stats.summary.activeUsersToday}</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">נרשמו היום</p>
                    <p className="text-3xl font-black text-blue-700 dark:text-blue-300">{stats.newUsersToday.length}</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800">
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">סה"כ משתמשים</p>
                    <p className="text-3xl font-black text-purple-700 dark:text-purple-300">{stats.summary.totalUsers}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* פירוט פעילות */}
                  <div className="space-y-4">
                    <h3 className="font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-blue-600" /> התפלגות הזנות היום</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <span className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-orange-500" /> הוצאות</span>
                        <span className="font-bold">{stats.activityBreakdown.expenses}</span>
                      </div>
                      <div className="flex justify-between text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500" /> הכנסות</span>
                        <span className="font-bold">{stats.activityBreakdown.incomes}</span>
                      </div>
                      <div className="flex justify-between text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <span className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-red-500" /> חובות</span>
                        <span className="font-bold">{stats.activityBreakdown.debts}</span>
                      </div>
                    </div>
                  </div>

                  {/* נרשמים חדשים */}
                  <div className="space-y-4">
                    <h3 className="font-bold flex items-center gap-2"><UserPlus className="w-5 h-5 text-indigo-600" /> הצטרפו היום</h3>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                      {stats.newUsersToday.length > 0 ? stats.newUsersToday.map((u, i) => (
                        <div key={i} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-gray-800 rounded-lg">
                          <span className="font-bold">{u.full_name || 'ללא שם'}</span>
                          <span className="text-gray-400">{u.email}</span>
                        </div>
                      )) : <p className="text-gray-400 text-sm italic">ממתינים לנרשמים חדשים...</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <AnnouncementManager />
            </div>
          </motion.div>
        )}

        {/* --- הגדרות פרופיל --- */}
        <Card className="border-none shadow-sm dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> פרופיל אישי
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <p className="text-xs text-gray-400 mb-1">שם מלא</p>
                <p className="font-bold text-lg dark:text-white">{user?.full_name}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <p className="text-xs text-gray-400 mb-1">אימייל</p>
                <p className="font-bold dark:text-white">{user?.email}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="w-full rounded-xl text-red-600 border-red-100 hover:bg-red-50">
              <LogOut className="w-4 h-4 ml-2" /> התנתק
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}