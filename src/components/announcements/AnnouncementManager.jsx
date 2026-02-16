import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Megaphone, Plus, Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnnouncementManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({ content: '', is_active: false, direction: 'ltr', speed: 3 });
  const queryClient = useQueryClient();

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements-admin'],
    queryFn: () => base44.entities.Announcement.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Announcement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements-admin']);
      queryClient.invalidateQueries(['announcements']);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Announcement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements-admin']);
      queryClient.invalidateQueries(['announcements']);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Announcement.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements-admin']);
      queryClient.invalidateQueries(['announcements']);
    }
  });

  const resetForm = () => {
    setFormData({ content: '', is_active: false, direction: 'ltr', speed: 3 });
    setEditingAnnouncement(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({ content: announcement.content, is_active: announcement.is_active, direction: announcement.direction || 'ltr', speed: announcement.speed || 3 });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-200">
            <Megaphone className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            ניהול הודעות מערכת
          </CardTitle>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 ml-2" />
            הודעה חדשה
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>אין הודעות במערכת</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {announcements.map((announcement) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-gray-100 break-words">{announcement.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${announcement.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                          {announcement.is_active ? 'פעיל' : 'לא פעיל'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(announcement.created_date).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(announcement)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(announcement.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingAnnouncement ? 'ערוך הודעה' : 'הודעה חדשה'}</DialogTitle>
              <DialogDescription>
                צור הודעה שתוצג בפס החדשות בדף הראשי של כל המשתמשים
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="content">תוכן ההודעה</Label>
                <Input
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="הכנס את תוכן ההודעה..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="direction">כיוון גלילה</Label>
                <Select value={formData.direction} onValueChange={(value) => setFormData({ ...formData, direction: value })}>
                  <SelectTrigger id="direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ltr">משמאל לימין (עברית) ←</SelectItem>
                    <SelectItem value="rtl">מימין לשמאל (אנגלית) →</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="speed">מהירות גלילה</Label>
                <Select value={formData.speed.toString()} onValueChange={(value) => setFormData({ ...formData, speed: parseInt(value) })}>
                  <SelectTrigger id="speed">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - איטי מאוד 🐌</SelectItem>
                    <SelectItem value="2">2 - איטי</SelectItem>
                    <SelectItem value="3">3 - בינוני</SelectItem>
                    <SelectItem value="4">4 - מהיר</SelectItem>
                    <SelectItem value="5">5 - מהיר מאוד 🚀</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Label htmlFor="is_active" className="cursor-pointer">הודעה פעילה</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  ביטול
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                  {editingAnnouncement ? 'עדכן' : 'צור הודעה'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}