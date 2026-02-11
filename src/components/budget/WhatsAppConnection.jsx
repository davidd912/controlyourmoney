import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Copy, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function WhatsAppConnection({ household }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activationCode, setActivationCode] = useState(household?.activation_code);
  const [expiresAt, setExpiresAt] = useState(household?.activation_code_expires);

  // Check if code is expired
  const isExpired = expiresAt && new Date(expiresAt) < new Date();
  const isConnected = household?.whatsapp_number;

  const generateCode = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateActivationCode', {
        household_id: household.id
      });
      setActivationCode(response.data.activation_code);
      setExpiresAt(response.data.expires_at);
      toast.success('קוד חדש נוצר בהצלחה!');
    } catch (error) {
      toast.error('שגיאה ביצירת הקוד');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(activationCode);
    setCopied(true);
    toast.success('הקוד הועתק!');
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = () => {
    // Navigate to dedicated WhatsApp connection page
    navigate(createPageUrl('WhatsAppConnect'), {
      state: {
        activationCode: activationCode,
        householdName: household?.name
      }
    });
  };

  if (isConnected) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-green-700 dark:text-green-400">מחובר לוואטסאפ</CardTitle>
              <CardDescription className="text-green-600 dark:text-green-500">
                המספר: {household.whatsapp_number}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span>כעת תוכל לשלוח הודעות מהוואטסאפ לניהול התקציב</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-green-700 dark:text-green-400">חיבור לוואטסאפ</CardTitle>
            <CardDescription className="text-green-600 dark:text-green-500">
              נהל את התקציב שלך דרך הודעות וואטסאפ
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(!activationCode || isExpired) ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              צור קוד הפעלה חדש כדי לחבר את חשבון הוואטסאפ שלך
            </p>
            <Button 
              onClick={generateCode} 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  יוצר קוד...
                </>
              ) : (
                'צור קוד הפעלה'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-dashed border-green-300 dark:border-green-700">
              <p className="text-xs text-muted-foreground mb-2">הקוד שלך:</p>
              <div className="flex items-center justify-between gap-2">
                <code className="text-2xl font-bold text-green-700 dark:text-green-400 tracking-wider">
                  {activationCode}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyCode}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                תקף עד: {new Date(expiresAt).toLocaleString('he-IL')}
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={openWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="w-4 h-4 ml-2" />
                שלח קוד בוואטסאפ
                <ExternalLink className="w-3 h-3 mr-2" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={generateCode}
                disabled={loading}
                className="w-full text-xs"
              >
                צור קוד חדש
              </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <p className="font-semibold mb-1">📱 הוראות:</p>
              <ol className="space-y-1 mr-4">
                <li>1. לחץ על "שלח קוד בוואטסאפ"</li>
                <li>2. הקוד יופיע אוטומטית בהודעה</li>
                <li>3. לחץ שלח בוואטסאפ</li>
                <li>4. החשבון שלך יחובר מיד!</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}