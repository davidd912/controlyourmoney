import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, Mail, Home, UserPlus, User, LogOut, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function UserSettings() {
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
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

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <User className="w-8 h-8 text-blue-600" />
            הגדרות משתמש
          </h1>
          <p className="text-gray-500">
            נהל את הפרופיל שלך ואת משקי הבית המשותפים
          </p>
        </motion.div>

        {/* User Profile Card */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              פרופיל אישי
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium mb-2">שם מלא</label>
              {!isEditingName ? (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg font-semibold">{user?.full_name}</span>
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
              <label className="block text-sm font-medium mb-2">אימייל</label>
              <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{user?.email}</span>
              </div>
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <LogOut className="w-4 h-4 ml-2" />
                התנתק מהמערכת
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Household Management Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="w-6 h-6 text-blue-600" />
            משקי בית משותפים
          </h2>
          <p className="text-gray-500 mb-4">
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
                  <label className="block text-sm font-medium mb-2">שם משק הבית</label>
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
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">עדיין לא יצרת משק בית</p>
                <p className="text-sm text-gray-400">
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
                          <Home className="w-5 h-5 text-blue-600" />
                          {household.name}
                        </CardTitle>
                        {isOwner && (
                          <Badge className="mt-2 bg-blue-100 text-blue-700">בעלים</Badge>
                        )}
                      </div>
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHousehold.mutate(household.id)}
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
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        חברים ({household.members?.length || 0})
                      </h3>
                      <div className="space-y-2">
                        {household.members?.map((memberEmail) => (
                          <div
                            key={memberEmail}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{memberEmail}</span>
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

                    {/* Invite Member */}
                    {isOwner && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
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
                        <p className="text-xs text-gray-500 mt-2">
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
      </div>
    </div>
  );
}