import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import MobileSelect from '@/components/budget/MobileSelect';

const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];

export default function MonthYearSelector({ month, year, onMonthChange, onYearChange }) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

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

  // Generate year options (current year ± 5 years)
  const yearOptions = [];
  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    yearOptions.push(y);
  }

  return (
    <div className="flex items-center gap-2 mb-6 flex-wrap">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevMonth}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2">
        <MobileSelect
          value={month.toString()}
          onValueChange={(val) => onMonthChange(parseInt(val))}
          placeholder={HEBREW_MONTHS[month - 1]}
          label="בחר חודש"
          options={HEBREW_MONTHS.map((monthName, index) => ({
            value: (index + 1).toString(),
            label: monthName
          }))}
        />

        <MobileSelect
          value={year.toString()}
          onValueChange={(val) => onYearChange(parseInt(val))}
          placeholder={year.toString()}
          label="בחר שנה"
          options={yearOptions.map((y) => ({
            value: y.toString(),
            label: y.toString()
          }))}
        />
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNextMonth}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {!isCurrentMonth && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="gap-2"
        >
          <Calendar className="h-4 w-4" />
          חודש נוכחי
        </Button>
      )}
    </div>
  );
}