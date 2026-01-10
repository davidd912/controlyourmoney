import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  PiggyBank,
  X
} from 'lucide-react';

export default function FloatingActionButton({ onOpenForm }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const options = [
    { 
      id: 'income', 
      label: 'הוספת הכנסות', 
      icon: TrendingUp, 
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-green-700'
    },
    { 
      id: 'expense', 
      label: 'הוספת הוצאות', 
      icon: TrendingDown, 
      color: 'bg-orange-500 hover:bg-orange-600',
      textColor: 'text-orange-700'
    },
    { 
      id: 'debt', 
      label: 'הוספת חובות', 
      icon: CreditCard, 
      color: 'bg-red-500 hover:bg-red-600',
      textColor: 'text-red-700'
    },
    { 
      id: 'asset', 
      label: 'הוספת חסכונות', 
      icon: PiggyBank, 
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-purple-700'
    }
  ];

  const handleSelect = (optionId) => {
    setIsOpen(false);
    onOpenForm(optionId);
  };

  return (
    <>
      {/* FAB Button - Mobile Only */}
      <motion.div
        className="fixed bottom-6 left-6 z-50 md:hidden"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-14 w-14 rounded-full shadow-2xl transition-all ${
            isOpen 
              ? 'bg-gray-700 hover:bg-gray-800 rotate-45' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          size="icon"
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      </motion.div>

      {/* Bottom Sheet Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 md:hidden"
            >
              {/* Handle */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Content */}
              <div className="px-6 pb-8 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  בחר פעולה
                </h3>

                <div className="space-y-3">
                  {options.map((option) => {
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.id}
                        onClick={() => handleSelect(option.id)}
                        className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`p-3 ${option.color} rounded-xl`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-lg font-medium text-gray-900 flex-1 text-right">
                          {option.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Close Button */}
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  className="w-full mt-4 h-12 text-base"
                >
                  ביטול
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}