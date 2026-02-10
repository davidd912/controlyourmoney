import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, Mail, Home, UserPlus, User, LogOut, Edit, BarChart3, Calendar, UserX } from "lucide-react";
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
        h.owner_email === user.email || 
        (h.members && h.members.includes(user.email))
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
    mutationFn: (id) => base44.entities.Household.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['households']);
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
    base44.auth.logout();
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

  return (
    <div dir="rtl" className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            הגדרות משתמש
          </h1>
          <p className="text-muted-foreground">
            נהל את הפרופיל שלך ואת משקי הבית המשותפים
          </p>
        </motion.div>

        {/* User Profile Card */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              פרופיל אישי
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">שם מלא</label>
              {!isEditingName ? (
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-lg font-semibold text-foreground">{user?.full_name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingName(true);
                      setNewFullName(user?.full_name || '');
                    }}
                    className="text-primary hover:text-primary"
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
              <label className="block text-sm font-medium mb-2 text-foreground">אימייל</label>
              <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{user?.email}</span>
              </div>
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t space-y-2">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
              >
                <LogOut className="w-4 h-4 ml-2" />
                התנתק מהמערכת
              </Button>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="outline"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
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
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  סטטיסטיקות מערכת - Admin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Today's Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-card rounded-lg border-2 border-primary/30">
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">משתמשים חדשים היום</h3>
                    </div>
                    <p className="text-3xl font-bold text-primary mb-2">{stats.newUsersToday?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">סה״כ במערכת: {stats.totalUsers}</p>
                  </div>
                  <div className="p-4 bg-card rounded-lg border-2 border-success/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-5 h-5 text-success" />
                      <h3 className="font-semibold text-foreground">משקי בית חדשים היום</h3>
                    </div>
                    <p className="text-3xl font-bold text-success mb-2">{stats.newHouseholdsToday?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">סה״כ במערכת: {stats.totalHouseholds}</p>
                  </div>
                </div>

                {/* Users by Date */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <Calendar className="w-5 h-5 text-primary" />
                    משתמשים לפי תאריך
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(stats.usersByDate || {})
                      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                      .map(([date, users]) => (
                        <div key={date} className="bg-card p-3 rounded-lg border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-foreground">{new Date(date).toLocaleDateString('he-IL')}</span>
                            <Badge className="bg-primary/10 text-primary">{users.length} משתמשים</Badge>
                          </div>
                          <div className="space-y-1">
                            {users.map(u => (
                              <div key={u.id} className="text-sm text-muted-foreground flex items-center gap-2">
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
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <Calendar className="w-5 h-5 text-success" />
                    משקי בית לפי תאריך
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(stats.householdsByDate || {})
                      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                      .map(([date, households]) => (
                        <div key={date} className="bg-card p-3 rounded-lg border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-foreground">{new Date(date).toLocaleDateString('he-IL')}</span>
                            <Badge className="bg-success/10 text-success">{households.length} משקי בית</Badge>
                          </div>
                          <div className="space-y-1">
                            {households.map(h => (
                              <div key={h.id} className="text-sm text-muted-foreground flex items-center gap-2">
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
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Home className="w-6 h-6 text-primary" />
            משקי בית משותפים
          </h2>
          <p className="text-muted-foreground mb-4">
            צור משק בית משותף והזמן בן/בת זוג או שותפים לנהל את התקציב ביחד
          </p>
        </div>

        {/* Create New Household */}
        {!showCreateForm ? (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="mb-6 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 ml-2" />
            צור משק בית חדש
          </Button>
        ) : (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <form onSubmit={handleCreateHousehold} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">שם משק הבית</label>
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
        )}

        {/* Existing Households */}
        <div className="space-y-4">
          {households.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">עדיין לא יצרת משק בית</p>
                <p className="text-sm text-muted-foreground">
                  צור משק בית כדי להתחיל לנהל תקציב משותף
                </p>
              </CardContent>
            </Card>
          ) : (
            households.map((household) => {
              const isOwner = household.owner_email === user?.email;
              return (
                <Card key={household.id} className="border-2">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Home className="w-5 h-5 text-primary" />
                          {household.name}
                        </CardTitle>
                        {isOwner && (
                          <Badge className="mt-2 bg-primary/10 text-primary">בעלים</Badge>
                        )}
                      </div>
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHousehold.mutate(household.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Members List */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                        <Users className="w-4 h-4" />
                        חברים ({household.members?.length || 0})
                      </h3>
                      <div className="space-y-2">
                        {household.members?.map((memberEmail) => (
                          <div
                            key={memberEmail}
                            className="flex justify-between items-center p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{memberEmail}</span>
                              {memberEmail === household.owner_email && (
                                <Badge variant="outline" className="text-xs">בעלים</Badge>
                              )}
                            </div>
                            {isOwner && memberEmail !== household.owner_email && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMember.mutate({ householdId: household.id, email: memberEmail })}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Invite Member */}
                    {isOwner && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
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
                        <p className="text-xs text-muted-foreground mt-2">
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