import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Copy, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from 'sonner';

export default function WhatsAppConnect() {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  
  const activationCode = location.state?.activationCode;
  const householdName = location.state?.householdName;

  useEffect(() => {
    // If no activation code, redirect back
    if (!activationCode) {
      navigate(-1);
    }
  }, [activationCode, navigate]);

  const copyCode = () => {
    navigator.clipboard.writeText(activationCode);
    setCopied(true);
    toast.success('הקוד הועתק!');
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = () => {
    // Replace with your actual Twilio WhatsApp Sandbox number
    const twilioNumber = '14155238886'; // REPLACE WITH YOUR TWILIO NUMBER
    const message = encodeURIComponent(activationCode);
    const url = `https://wa.me/${twilioNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  if (!activationCode) {
    return null;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-green-200 dark:border-green-800 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-green-700 dark:text-green-400 mb-2">
                {householdName || 'משק הבית'}
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                שלח את ההודעה הזו כדי להתחבר ולהתחיל לשוחח!
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Activation Code Display */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border-2 border-dashed border-green-300 dark:border-green-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3">
                קוד הפעלה:
              </p>
              <div className="flex items-center justify-center gap-3">
                <code className="text-3xl font-bold text-green-700 dark:text-green-400 tracking-widest">
                  {activationCode}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyCode}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Open WhatsApp Button */}
            <Button
              onClick={openWhatsApp}
              className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg font-semibold shadow-lg"
            >
              <MessageCircle className="w-6 h-6 ml-2" />
              פתיחת האפליקציה
              <ArrowRight className="w-5 h-5 mr-2" />
            </Button>

            {/* Web WhatsApp Option */}
            <div className="text-center">
              <a
                href={`https://web.whatsapp.com/send?phone=14155238886&text=${encodeURIComponent(activationCode)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                להמשיך ב-WhatsApp Web →
              </a>
            </div>

            {/* Instructions */}
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-300 text-center">
                <span className="inline-block ml-2">🔒</span>
                עדיין לא הורדת את האפליקציה?{' '}
                <a 
                  href="https://www.whatsapp.com/download" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  להורדה
                </a>
              </p>
            </div>

            {/* Back Button */}
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full"
            >
              חזרה
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}