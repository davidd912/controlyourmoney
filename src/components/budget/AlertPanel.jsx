import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '@/components/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  Lightbulb,
  X,
  Eye,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const severityConfig = {
  low: {
    color: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-400',
    badgeColor: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    icon: Lightbulb
  },
  medium: {
    color: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    badgeColor: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    icon: AlertTriangle
  },
  high: {
    color: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-700 dark:text-orange-400',
    badgeColor: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
    icon: TrendingUp
  },
  critical: {
    color: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
    textColor: 'text-red-700 dark:text-red-400',
    badgeColor: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
    icon: AlertTriangle
  }
};

const typeLabels = {
  budget_exceeded: 'חריגה מתקציב',
  high_expense: 'הוצאה גבוהה',
  debt_reminder: 'תזכורת חוב',
  savings_opportunity: 'הזדמנות לחסכון',
  unusual_pattern: 'דפוס חריג'
};

export default function AlertPanel({ alerts, onDismiss, onMarkRead, onRefresh, isGenerating }) {
  const [filter, setFilter] = useState('all');

  const filteredAlerts = alerts.filter(alert => {
    if (alert.is_dismissed) return false;
    if (filter === 'all') return true;
    if (filter === 'unread') return !alert.is_read;
    return alert.severity === filter;
  });

  const unreadCount = alerts.filter(a => !a.is_read && !a.is_dismissed).length;

  return (
    <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <div className="text-right">
              <CardTitle className="text-lg">התראות חכמות</CardTitle>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {unreadCount} התראות שלא נקראו
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={onRefresh}
            disabled={isGenerating}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'מנתח...' : 'נתח מחדש'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            הכל ({alerts.filter(a => !a.is_dismissed).length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            לא נקראו ({unreadCount})
          </Button>
          <Button
            variant={filter === 'critical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('critical')}
            className={filter === 'critical' ? 'bg-red-600' : ''}
          >
            קריטי ({alerts.filter(a => a.severity === 'critical' && !a.is_dismissed).length})
          </Button>
          <Button
            variant={filter === 'high' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('high')}
            className={filter === 'high' ? 'bg-orange-600' : ''}
          >
            גבוה ({alerts.filter(a => a.severity === 'high' && !a.is_dismissed).length})
          </Button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredAlerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 text-muted-foreground"
              >
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-right">אין התראות חדשות</p>
              </motion.div>
            ) : (
              filteredAlerts.map((alert) => {
                const config = severityConfig[alert.severity];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`p-4 rounded-lg border-2 ${config.color} ${!alert.is_read ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-purple-300 dark:ring-purple-600' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-1 ${config.textColor}`} />
                      <div className="flex-1 text-right">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">{alert.title}</h3>
                              {!alert.is_read && (
                                <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs">חדש</Badge>
                              )}
                            </div>
                            <Badge className={`${config.badgeColor} text-xs mb-2`}>
                              {typeLabels[alert.alert_type]}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            {!alert.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMarkRead(alert.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDismiss(alert.id)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-foreground mb-2">{alert.message}</p>

                        {alert.amount && (
                          <p className="text-sm font-semibold text-foreground mb-2">
                            סכום: ₪{alert.amount.toLocaleString()}
                          </p>
                        )}

                        {alert.suggestion && (
                          <div className="mt-3 p-3 bg-white/60 dark:bg-gray-700/60 rounded-lg border text-right">
                            <p className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                              המלצה:
                            </p>
                            <p className="text-sm text-muted-foreground">{alert.suggestion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}