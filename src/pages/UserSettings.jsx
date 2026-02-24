import React, { useState, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, Mail, Home, UserPlus, User, LogOut, Edit, BarChart3, Calendar, UserX, Smartphone, Copy, RefreshCw, MessageCircle, Send } from "lucide-react";
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

  const { data: stats } = useQuery({
    queryKey: ['todayStats'],
    queryFn: async () => {
      if (!user || user.role !== 'admin') return null;
      const result = await base44.functions.invoke('getTodayStats');
      return result.data;
    },
    enabled: !!user && user.role === 'admin',
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
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            הגדרות משתמש
          </h1>
          <p className="text-gray-700 dark:text-gray-200">
            נהל את הפרופיל שלך ואת משקי הבית המשותפים
          </p>
        </motion.div>

        <Card className="mb-6 border-2 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              פרופיל אישי
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">שם מלא</label>
              {!isEditingName ? (
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">{user?.full_name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingName(true);
                      setNewFullName(user?.full_name || '');
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    ערוך
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleUpdateName} className="space-y-3">
                  <Input
                    placeholder="הכנס שם מלא"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      שמור
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditingName(false);
                        setNewFullName('');
                      }}
                    >
                      ביטול
                    </Button>
                  </div>
                </form>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">אימייל</label>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-900 dark:text-gray-100">{user?.email}</span>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200"
              >
                <LogOut className="w-4 h-4 ml-2" />
                התנתק מהמערכת
              </Button>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="outline"
                className="w-full text-red-700 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-950 border-red-300"
              >
                <UserX className="w-4 h-4 ml-2" />
                מחק חשבון לצמיתות
              </Button>
            </div>
          </CardContent>
        </Card>

        {user?.role === 'admin' && (
          <div className="mb-6">
            <AnnouncementManager />
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Home className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            משקי בית משותפים
          </h2>
        </div>

        <div className="space-y-4">
          {households.map((household) => {
            const isOwner = household.owner_email === user?.email;
            return (
              <Card key={household.id} className="border-2 dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 dark:text-white">
                        <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        {household.name}
                      </CardTitle>
                    </div>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setHouseholdToDelete(household);
                          setShowDeleteHouseholdDialog(true);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isOwner && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                        חיבור לבוט האישי (WhatsApp / Telegram)
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <Button
                          onClick={() => handleWhatsAppConnect(household)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Smartphone className="w-4 h-4 ml-2" />
                          פתח ב-WhatsApp
                        </Button>
                        <Button
                          onClick={() => handleTelegramConnect(household)}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                        >
                          <Send className="w-4 h-4 ml-2" />
                          פתח ב-Telegram
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {(!household.activation_code || new Date(household.activation_code_expires) < new Date()) && (
                          <div className="mt-2">
                            <Button
                              onClick={() => handleGenerateActivationCode(household.id)}
                              disabled={generatingCode[household.id]}
                              className="w-full bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600"
                            >
                              <RefreshCw className={`w-4 h-4 ml-2 ${generatingCode[household.id] ? 'animate-spin' : ''}`} />
                              צור קוד הפעלה לחיבור הבוט
                            </Button>
                          </div>
                        )}

                        {household.activation_code && new Date(household.activation_code_expires) > new Date() && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-gray-700 shadow-sm">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 dark:text-gray-400">קוד:</span>
                                <span className="text-2xl font-bold tracking-widest text-blue-600 dark:text-blue-400">
                                  {household.activation_code}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(household.activation_code)}
                                className="hover:bg-blue-50 dark:hover:bg-gray-700"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ⏰ תקף עד: {new Date(household.activation_code_expires).toLocaleString('he-IL')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {isOwner && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <UserPlus className="w-4 h-4" />
                        הזמן חבר חדש
                      </h3>
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="הכנס כתובת אימייל"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                        <Button
                          onClick={() => handleInvite(household.id)}
                          disabled={!inviteEmail.trim() || !inviteEmail.includes('@')}
                        >
                          שלח הזמנה
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}