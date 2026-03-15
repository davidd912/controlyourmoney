import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import MobileSelect from '@/components/budget/MobileSelect';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import '@/components/i18n';

export default function MonthYearSelector({ month, year, onMonthChange, onYearChange }) {
  const { t } = useTranslation();
  const { direction } = useLocale();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // מערך מפתחות החודשים שתואם לקובץ ה-i18n המעודכן
  const monthKeys = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12);
      onYearChange(year - 1);
    } else {
      onMonthChange(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1);
      onYearChange(year + 1);
    } else {
      onMonthChange(month + 1);
    }
  };

  const handleToday = () => {
    onMonthChange(currentMonth);
    onYearChange(currentYear);
  };

  const isCurrentMonth = month === currentMonth && year === currentYear;

  // יצירת אפשרויות שנה (טווח של 10 שנים סביב השנה הנוכחית)
  const yearOptions = [];
  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    yearOptions.push(y);
  }

  // הגדרת האייקונים לפי כיוון השפה (RTL vs LTR)
  const PrevIcon = direction === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = direction === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <div className="flex items-center gap-2 mb-6 flex-wrap" dir={direction}>
      {/* כפתור חודש קודם */}
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevMonth}
        className="h-9 w-9 border-slate-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
      >
        <PrevIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      </Button>

      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-md border shadow-sm">
        {/* בחירת חודש - עכשיו מתורגם */}
        <MobileSelect
          value={month.toString()}
          onValueChange={(val) => onMonthChange(parseInt(val))}
          placeholder={t(`months.${monthKeys[month - 1]}`)}
          label={t('select_month')}
          options={monthKeys.map((key, index) => ({
            value: (index + 1).toString(),
            label: t(`months.${key}`)
          }))}
        />

        <div className="w-px h-4 bg-slate-200 dark:bg-gray-700 mx-1" />

        {/* בחירת שנה */}
        <MobileSelect
          value={year.toString()}
          onValueChange={(val) => onYearChange(parseInt(val))}
          placeholder={year.toString()}
          label={t('select_year')}
          options={yearOptions.map((y) => ({
            value: y.toString(),
            label: y.toString()
          }))}
        />
      </div>

      {/* כפתור חודש הבא */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextMonth}
        className="h-9 w-9 border-slate-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
      >
        <NextIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      </Button>

      {/* כפתור חזרה להיום - מופיע רק אם לא נמצאים בחודש הנוכחי */}
      {!isCurrentMonth && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-900/20"
        >
          <Calendar className="h-4 w-4" />
          {t('current_month')}
        </Button>
      )}
    </div>
  );
}