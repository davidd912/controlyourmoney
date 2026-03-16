import React, { useState, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Trash2, Mail, Home, UserPlus, User, LogOut, Edit, BarChart3, Calendar, UserX, Smartphone, Copy, RefreshCw, MessageCircle, Send, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AnnouncementManager from '@/components/announcements/AnnouncementManager';
import { HouseholdContext } from '../Layout';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';

export default function UserSettings() {
  const { t } = useTranslation();
  const { direction } = useLocale();
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
    mutationFn: (fullName) => base44.auth.updateMe({ full_name: fullName }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['user'] }); setIsEditingName(false); setNewFullName(''); }
  });

  const createHousehold = useMutation({
    mutationFn: (name) => base44.entities.Household.create({ name, owner_email: user.email, members: [user.email] }),
    onSuccess: () => { setNewHouseholdName(''); setShowCreateForm(false); navigate(createPageUrl('Dashboard')); }
  });

  const inviteMember = useMutation({
    mutationFn: async ({ householdId, email }) => {
      const household = households.find(h => h.id === householdId);
      const updatedMembers = [...(household.members || []), email];
      await base44.entities.Household.update(householdId, { members: updatedMembers });
      await base44.users.inviteUser(email, 'user');
    },
    onSuccess: () => { setInviteEmail(''); alert(t('us_invite_success')); }
  });

  const removeMember = useMutation({
    mutationFn: async ({ householdId, email }) => {
      const household = households.find(h => h.id === householdId);
      const updatedMembers = household.members.filter(m => m !== email);
      return base44.entities.Household.update(householdId, { members: updatedMembers });
    },
  });

  const deleteHousehold = useMutation({
    mutationFn: async (id) => {
      const now = new Date().toISOString();
      return base44.entities.Household.update(id, { is_deleted: true, deleted_at: now, whatsapp_numbers: [] });
    },
    onSuccess: () => { setShowDeleteHouseholdDialog(false); setHouseholdToDelete(null); }
  });

  const handleCreateHousehold = (e) => {
    e.preventDefault();
    if (newHouseholdName.trim()) createHousehold.mutate(newHouseholdName);
  };

  const handleInvite = (householdId) => {
    if (inviteEmail.trim() && inviteEmail.includes('@')) inviteMember.mutate({ householdId, email: inviteEmail });
  };

  const handleUpdateName = (e) => {
    e.preventDefault();
    if (newFullName.trim()) updateUserName.mutate(newFullName);
  };

  const handleLogout = () => {
    queryClient.clear();
    base44.auth.logout(window.location.origin);
  };

  const handleDeleteAccount = async () => {
    const userHouseholds = households.filter(h => h.owner_email === user.email);
    for (const household of userHouseholds) await base44.entities.Household.delete(household.id);
    alert(t('us_delete_account_done'));
    base44.auth.logout();
  };

  const handleGenerateActivationCode = async (householdId) => {
    setGeneratingCode({ ...generatingCode, [householdId]: true });
    await base44.functions.invoke('generateActivationCode', { household_id: householdId });
    queryClient.invalidateQueries({ queryKey: ['userHouseholds'] });
    setGeneratingCode({ ...generatingCode, [householdId]: false });
    window.location.reload();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(t('us_copy_success'));
  };

  const handleWhatsAppConnect = async (household) => {
    let code = household.activation_code;
    let expiresAt = household.activation_code_expires;
    const isExpired = expiresAt && new Date(expiresAt) < new Date();
    if (!code || isExpired) {
      const response = await base44.functions.invoke('generateActivationCode', { household_id: household.id });
      code = response.data.activation_code;
    }
    const systemConfig = await base44.entities.SystemConfig.list();
    const whatsappBotNumberItem = systemConfig?.find(config => config.key === 'whatsapp_bot_number');
    const whatsappNumber = whatsappBotNumberItem?.value || '972559725996';
    const message = encodeURIComponent(code);
    window.open(`https://api.whatsapp.com/send/?phone=${whatsappNumber}&text=${message}&type=phone_number&app_absent=0`, '_blank');
  };

  const handleTelegramConnect = async (household) => {
    let code = household.activation_code;
    let expiresAt = household.activation_code_expires;
    const isExpired = expiresAt && new Date(expiresAt) < new Date();
    if (!code || isExpired) {
      const response = await base44.functions.invoke('generateActivationCode', { household_id: household.id });
      code = response.data.activation_code;
    }
    const systemConfig = await base44.entities.SystemConfig.list();
    const telegramBotUsernameItem = systemConfig?.find(config => config.key === 'telegram_bot_username');
    const botUsername = telegramBotUsernameItem?.value || 'controlyourmoneyy_bot';
    const message = encodeURIComponent(t('us_telegram_activation_msg', { code }));
    window.open(`https://t.me/${botUsername}?text=${message}`, '_blank');
  };

  return (
    <div dir={direction} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            {t('us_title')}
          </h1>
          <p className="text-gray-700 dark:text-gray-200">{t('us_subtitle')}</p>
        </motion.div>

        {/* Profile Card */}
        <Card className="mb-6 border-2 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t('us_profile_title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">{t('us_full_name')}</label>
              {!isEditingName ? (
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">{user?.full_name}</span>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm" onClick={() => { setIsEditingName(true); setNewFullName(user?.full_name || ''); }} className="text-blue-600 hover:text-blue-700">
                      <Edit className="w-4 h-4 me-1" />{t('us_edit')}
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <form onSubmit={handleUpdateName} className="space-y-3">
                  <Input placeholder={t('us_enter_name')} value={newFullName} onChange={(e) => setNewFullName(e.target.value)} />
                  <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{t('us_save')}</Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button type="button" variant="outline" onClick={() => { setIsEditingName(false); setNewFullName(''); }}>{t('cancel')}</Button>
                    </motion.div>
                  </div>
                </form>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">{t('us_email')}</label>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-900 dark:text-gray-100">{user?.email}</span>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={handleLogout} variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200">
                  <LogOut className="w-4 h-4 me-2" />{t('us_logout')}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={() => setShowDeleteDialog(true)} variant="outline" className="w-full text-red-700 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-950 border-red-300">
                  <UserX className="w-4 h-4 me-2" />{t('us_delete_account')}
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Stats */}
        {user?.role === 'admin' && (
          <>
            <Card className="mb-6 border-2 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  {t('us_admin_stats_title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('us_new_users_today')}</p>
                        </div>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.newUsersToday?.length || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('us_total_users')}: {stats.totalUsers || 0}</p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Home className="w-5 h-5 text-green-600" />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('us_new_hh_today')}</p>
                        </div>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.newHouseholdsToday?.length || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('us_total_hh')}: {stats.totalHouseholds || 0}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                        <Calendar className="w-5 h-5 text-purple-600" />{t('us_users_by_date')}
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {Object.entries(stats.usersByDate || {}).sort((a, b) => b[0].localeCompare(a[0])).map(([date, users]) => (
                          <div key={date} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <Badge variant="secondary" className="text-xs">{t('us_user_count', { count: users.length })}</Badge>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{new Date(date).toLocaleDateString()}</span>
                            </div>
                            <div className="space-y-1">
                              {users.map(u => (
                                <div key={u.id} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                  <Mail className="w-3 h-3" />{u.full_name} ({u.email})
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                        <Calendar className="w-5 h-5 text-green-600" />{t('us_hh_by_date')}
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {Object.entries(stats.householdsByDate || {}).sort((a, b) => b[0].localeCompare(a[0])).map(([date, hhs]) => (
                          <div key={date} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <Badge className="text-xs bg-green-100 text-green-800">{t('us_hh_count', { count: hhs.length })}</Badge>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{new Date(date).toLocaleDateString()}</span>
                            </div>
                            <div className="space-y-1">
                              {hhs.map(h => (
                                <div key={h.id} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                  <Home className="w-3 h-3" />{h.name} - {h.owner_email} ({h.members_count} {t('members_label')})
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">{t('us_loading')}</p>
                )}
              </CardContent>
            </Card>
            <div className="mb-6"><AnnouncementManager /></div>
          </>
        )}

        {/* Households */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Home className="w-6 h-6 text-blue-600 dark:text-blue-400" />{t('us_hh_section_title')}
          </h2>
        </div>

        <div className="space-y-4">
          {households.map((household) => {
            const isOwner = household.owner_email === user?.email;
            return (
              <Card key={household.id} className="border-2 dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      {household.name}
                    </CardTitle>
                    {isOwner && (
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button variant="ghost" size="sm" onClick={() => { setHouseholdToDelete(household); setShowDeleteHouseholdDialog(true); }} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isOwner && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <MessageCircle className="w-5 h-5 text-blue-600" />{t('us_bot_connect_title')}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                          <Button onClick={() => handleWhatsAppConnect(household)} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            <Smartphone className="w-4 h-4 me-2" />{t('us_open_whatsapp')}
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                          <Button onClick={() => handleTelegramConnect(household)} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                            <Send className="w-4 h-4 me-2" />{t('us_open_telegram')}
                          </Button>
                        </motion.div>
                      </div>
                      <div className="space-y-4">
                        {(!household.activation_code || new Date(household.activation_code_expires) < new Date()) && (
                          <div className="mt-2">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button onClick={() => handleGenerateActivationCode(household.id)} disabled={generatingCode[household.id]}
                                className="w-full bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600">
                                <RefreshCw className={`w-4 h-4 me-2 ${generatingCode[household.id] ? 'animate-spin' : ''}`} />
                                {t('us_generate_code')}
                              </Button>
                            </motion.div>
                          </div>
                        )}
                        {household.activation_code && new Date(household.activation_code_expires) > new Date() && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-gray-700 shadow-sm">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 dark:text-gray-400">{t('us_code_label')}:</span>
                                <span className="text-2xl font-bold tracking-widest text-blue-600 dark:text-blue-400">{household.activation_code}</span>
                              </div>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(household.activation_code)} className="hover:bg-blue-50 dark:hover:bg-gray-700">
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </motion.div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ⏰ {t('us_code_valid')}: {new Date(household.activation_code_expires).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Members List */}
                  {household.members && household.members.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Users className="w-4 h-4" />{t('members_label')} ({household.members.length})
                      </h3>
                      <div className="space-y-2">
                        {household.members.map((memberEmail) => (
                          <div key={memberEmail} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-800 dark:text-gray-200">{memberEmail}</span>
                              {memberEmail === household.owner_email && (
                                <Badge variant="secondary" className="text-xs">{t('owner_suffix')}</Badge>
                              )}
                            </div>
                            {isOwner && memberEmail !== user?.email && (
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMember.mutate({ householdId: household.id, email: memberEmail })}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isOwner && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <UserPlus className="w-4 h-4" />{t('us_invite_title')}
                      </h3>
                      <div className="flex gap-2">
                        <Input type="email" placeholder={t('us_invite_placeholder')} value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button onClick={() => handleInvite(household.id)} disabled={!inviteEmail.trim() || !inviteEmail.includes('@')}>
                            {t('us_invite_btn')}
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Beautiful Custom Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-center text-xl text-red-600 dark:text-red-400">
              {t('us_delete_warning_title')}
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2 dark:text-gray-300">
              {t('us_delete_warning_desc_1')}
              <br/><br/>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {t('us_delete_warning_desc_bold')}
              </span>
              <br/>
              {t('us_delete_warning_desc_2')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-3 mt-6 sm:mt-8">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="w-full sm:w-auto">
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white gap-2">
              <Trash2 className="w-4 h-4" />
              {t('us_delete_confirm_btn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Basic Delete Household Dialog */}
      <AlertDialog open={showDeleteHouseholdDialog} onOpenChange={setShowDeleteHouseholdDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('us_delete_hh_dialog_title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('us_delete_hh_dialog_desc', { name: householdToDelete?.name })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteHousehold.mutate(householdToDelete?.id)} className="bg-red-600 hover:bg-red-700">{t('us_delete_hh_dialog_confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}