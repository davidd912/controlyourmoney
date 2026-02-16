import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, Mail, Home, UserPlus, User, LogOut, Edit, BarChart3, Calendar, UserX, Smartphone, Copy, RefreshCw, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
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

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: stats } = useQuery({
    queryKey: ['todayStats'],
    queryFn: async () => {
      if (!user || user.role !== 'admin') return null;
      const result = await base44.functions.invoke('getTodayStats');
      return result.data;
    },
    enabled: !!user && user.role === 'admin'
  });

  const { data: households = [] } = useQuery({
    queryKey: ['households'],
    queryFn: async () => {
      if (!user) return [];
      const all = await base44.entities.Household.list();
      return all.filter(h => 
        !h.is_deleted &&
        (h.owner_email === user.email || 
        (h.members && h.members.includes(user.email)))
      );
    },
    enabled: !!user
  });

  const updateUserName = useMutation({
    mutationFn: async (fullName) => {
      return base44.auth.updateMe({ full_name: fullName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
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
      queryClient.invalidateQueries(['households']);
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
      queryClient.invalidateQueries(['households']);
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
    onSuccess: () => {
      queryClient.invalidateQueries(['households']);
    }
  });

  const deleteHousehold = useMutation({
    mutationFn: async (id) => {
      const now = new Date().toISOString();
      return base44.entities.Household.update(id, {
        is_deleted: true,
        deleted_at: now
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['households']);
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
    try {
      // Delete all user's data first
      const userHouseholds = households.filter(h => h.owner_email === user.email);
      for (const household of userHouseholds) {
        await base44.entities.Household.delete(household.id);
      }
      
      // Then logout (account deletion would need backend support)
      alert('נתוני המשתמש נמחקו. אנא פנה לתמיכה למחיקת החשבון המלאה.');
      base44.auth.logout();
    } catch (error) {
      alert('שגיאה במחיקת החשבון: ' + error.message);
    }
  };

  const handleGenerateActivationCode = async (householdId) => {
    try {
      setGeneratingCode({ ...generatingCode, [householdId]: true });
      const response = await base44.functions.invoke('generateActivationCode', { household_id: householdId });
      queryClient.invalidateQueries(['households']);
      alert(`קוד ההפעלה שלך: ${response.data.activation_code}\n\nתוקף: 24 שעות`);
    } catch (error) {
      alert('שגיאה ביצירת קוד הפעלה: ' + error.message);
    } finally {
      setGeneratingCode({ ...generatingCode, [householdId]: false });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('הקוד הועתק ללוח');
  };

  const handleWhatsAppConnect = async (household) => {
    try {
      let code = household.activation_code;
      let expiresAt = household.activation_code_expires;
      
      const isExpired = expiresAt && new Date(expiresAt) < new Date();
      
      if (!code || isExpired) {
        const response = await base44.functions.invoke('generateActivationCode', {
          household_id: household.id
        });
        code = response.data.activation_code;
        await queryClient.invalidateQueries(['households']);
      }
      
      const whatsappNumber = '972559725996';
      const message = encodeURIComponent(code);
      const url = `https://api.whatsapp.com/send/?phone=${whatsappNumber}&text=${message}&type=phone_number&app_absent=0`;
      window.open(url, '_blank');
    } catch (error) {
      alert('שגיאה בחיבור ל-WhatsApp: ' + error.message);
    }
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

        {/* User Profile Card */}
        <Card className="mb-6 border-2 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              פרופיל אישי
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display Name */}
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

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">אימייל</label>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-900 dark:text-gray-100">{user?.email}</span>
              </div>
            </div>

            {/* Logout Button */}
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

        {/* Admin Stats Section */}
        {user?.role === 'admin' && stats && (
          <div className="mb-6">
            <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-200">
                  <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  סטטיסטיקות מערכת - Admin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Today's Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">משתמשים חדשים היום</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 mb-2">{stats.newUsersToday?.length || 0}</p>
                    <p className="text-sm text-gray-500">סה״כ במערכת: {stats.totalUsers}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-green-900">משקי בית חדשים היום</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-600 mb-2">{stats.newHouseholdsToday?.length || 0}</p>
                    <p className="text-sm text-gray-500">סה״כ במערכת: {stats.totalHouseholds}</p>
                  </div>
                </div>

                {/* Users by Date */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    משתמשים לפי תאריך
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(stats.usersByDate || {})
                      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                      .map(([date, users]) => (
                        <div key={date} className="bg-white p-3 rounded-lg border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-purple-900">{new Date(date).toLocaleDateString('he-IL')}</span>
                            <Badge className="bg-purple-100 text-purple-700">{users.length} משתמשים</Badge>
                          </div>
                          <div className="space-y-1">
                            {users.map(u => (
                              <div key={u.id} className="text-sm text-gray-600 flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                {u.full_name} ({u.email})
                                {u.role === 'admin' && <Badge variant="outline" className="text-xs">אדמין</Badge>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Households by Date */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    משקי בית לפי תאריך
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(stats.householdsByDate || {})
                      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                      .map(([date, households]) => (
                        <div key={date} className="bg-white p-3 rounded-lg border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-green-900">{new Date(date).toLocaleDateString('he-IL')}</span>
                            <Badge className="bg-green-100 text-green-700">{households.length} משקי בית</Badge>
                          </div>
                          <div className="space-y-1">
                            {households.map(h => (
                              <div key={h.id} className="text-sm text-gray-600 flex items-center gap-2">
                                <Home className="w-3 h-3" />
                                {h.name} - {h.owner_email} ({h.members_count} חברים)
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Household Management Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Home className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            משקי בית משותפים
          </h2>
          <p className="text-gray-700 dark:text-gray-200 mb-4">
            צור משק בית משותף והזמן בן/בת זוג או שותפים לנהל את התקציב ביחד
          </p>
        </div>

        {/* Create New Household */}
        {(user?.role === 'admin' || households.length === 0) && (
          !showCreateForm ? (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="mb-6 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 ml-2" />
              צור משק בית חדש
            </Button>
          ) : (
            <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6">
                <form onSubmit={handleCreateHousehold} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">שם משק הבית</label>
                    <Input
                      placeholder='לדוגמה: "משפחת כהן"'
                      value={newHouseholdName}
                      onChange={(e) => setNewHouseholdName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      צור משק בית
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewHouseholdName('');
                      }}
                    >
                      ביטול
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )
        )}

        {/* Existing Households */}
        <div className="space-y-4">
          {households.length === 0 ? (
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">עדיין לא יצרת משק בית</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  צור משק בית כדי להתחיל לנהל תקציב משותף
                </p>
              </CardContent>
            </Card>
          ) : (
            households.map((household) => {
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
                        {isOwner && (
                          <Badge className="mt-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">בעלים</Badge>
                        )}
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
                    {/* Members List */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Users className="w-4 h-4" />
                        חברים ({household.members?.length || 0})
                      </h3>
                      <div className="space-y-2">
                        {household.members?.map((memberEmail) => (
                          <div
                            key={memberEmail}
                            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              <span className="text-sm text-gray-900 dark:text-gray-100">{memberEmail}</span>
                              {memberEmail === household.owner_email && (
                                <Badge variant="outline" className="text-xs">בעלים</Badge>
                              )}
                            </div>
                            {isOwner && memberEmail !== household.owner_email && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMember.mutate({ householdId: household.id, email: memberEmail })}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* WhatsApp Integration */}
                    {isOwner && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border-2 border-green-200 dark:border-green-800">
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <Smartphone className="w-4 h-4 text-green-600" />
                          חיבור WhatsApp
                        </h3>

                        <Button
                          onClick={() => handleWhatsAppConnect(household)}
                          className="w-full mb-3 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Smartphone className="w-4 h-4 ml-2" />
                          פתח WhatsApp
                        </Button>
                        
                        {household.whatsapp_number ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <Smartphone className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">מחובר: {household.whatsapp_number}</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                              💬 כעת ניתן לשלוח הודעות חופשיות לניהול התקציב דרך WhatsApp
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {household.activation_code && new Date(household.activation_code_expires) > new Date() ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
                                  <span className="text-2xl font-bold text-green-600">{household.activation_code}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(household.activation_code)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300">
                                  ⏰ הקוד תקף עד: {new Date(household.activation_code_expires).toLocaleString('he-IL')}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-300">
                                  📱 שלח קוד זה בהודעה ראשונה ל-WhatsApp כדי לקשר את החשבון
                                </p>
                              </div>
                            ) : (
                              <div>
                                <Button
                                  onClick={() => handleGenerateActivationCode(household.id)}
                                  disabled={generatingCode[household.id]}
                                  className="w-full bg-green-600 hover:bg-green-700"
                                >
                                  <RefreshCw className={`w-4 h-4 ml-2 ${generatingCode[household.id] ? 'animate-spin' : ''}`} />
                                  צור קוד הפעלה
                                </Button>
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                                  🔐 קוד ההפעלה יאפשר לך לקשר את מספר ה-WhatsApp שלך למשק בית זה
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Invite Member */}
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
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                          המערכת תשלח הזמנה למייל שהוזן. אם המשתמש עדיין לא רשום, יישלח אליו מייל הרשמה.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Delete Household Dialog */}
        <AlertDialog open={showDeleteHouseholdDialog} onOpenChange={setShowDeleteHouseholdDialog}>
          <AlertDialogContent dir="rtl" className="bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                האם אתה בטוח שברצונך למחוק את משק הבית?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base text-gray-700 dark:text-gray-300 space-y-3">
                <p className="font-semibold text-red-600 dark:text-red-400">
                  משק הבית "{householdToDelete?.name}" יימחק באופן זמני.
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold text-blue-900 dark:text-blue-200 mb-2">ℹ️ מידע חשוב:</p>
                  <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-300">
                    <li>• ניתן לשחזר את משק הבית תוך 30 יום</li>
                    <li>• לאחר 30 יום המשק יימחק לצמיתות</li>
                    <li>• כל הנתונים (הכנסות, הוצאות, חובות) יישמרו</li>
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                ביטול
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteHousehold.mutate(householdToDelete?.id)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 ml-2" />
                מחק זמנית (ניתן לשחזור)
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Account Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
              <AlertDialogDescription>
                פעולה זו תמחק את כל הנתונים שלך לצמיתות, כולל משקי בית, הכנסות, הוצאות וחובות. לא ניתן לשחזר את הנתונים לאחר המחיקה.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700"
              >
                מחק חשבון
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}