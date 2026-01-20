import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2, Target, Calendar, TrendingUp, Sparkles } from "lucide-react";
import moment from 'moment';

const goalCategories = {
  vehicle: "רכב",
  property: "דירה/נכס",
  vacation: "טיול/חופשה",
  education: "חינוך/השכלה",
  emergency_fund: "קרן חירום",
  wedding: "חתונה",
  other: "אחר"
};

const priorities = {
  low: "נמוכה",
  medium: "בינונית",
  high: "גבוהה"
};

const priorityColors = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700"
};

export default function GoalCard({ goal, onEdit, onDelete, onGetRecommendations, isGenerating }) {
  const progress = goal.target_amount > 0 
    ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) 
    : 0;
  
  const remaining = goal.target_amount - goal.current_amount;
  const daysUntilTarget = goal.target_date 
    ? moment(goal.target_date).diff(moment(), 'days')
    : null;

  const monthsUntilTarget = daysUntilTarget ? Math.ceil(daysUntilTarget / 30) : null;
  const requiredMonthly = monthsUntilTarget && monthsUntilTarget > 0 
    ? remaining / monthsUntilTarget 
    : null;

  return (
    <Card className={`${goal.is_completed ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-lg">{goal.title}</CardTitle>
              {goal.is_completed && (
                <Badge className="bg-green-600 text-white">הושלם! 🎉</Badge>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{goalCategories[goal.category] || goal.category}</Badge>
              <Badge className={priorityColors[goal.priority]}>
                עדיפות: {priorities[goal.priority]}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(goal)}
              className="text-gray-500 hover:text-blue-600"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(goal.id)}
              className="text-gray-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {goal.description && (
          <p className="text-sm text-gray-600 text-right">{goal.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              ₪{goal.current_amount?.toLocaleString()} / ₪{goal.target_amount?.toLocaleString()}
            </span>
            <span className="font-bold text-purple-600">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded-lg text-right">
            <div className="text-gray-600 mb-1">נותר לחסוך</div>
            <div className="font-bold text-lg">₪{remaining.toLocaleString()}</div>
          </div>
          
          {goal.target_date && (
            <div className="p-3 bg-blue-50 rounded-lg text-right">
              <div className="text-gray-600 mb-1 flex items-center gap-1 justify-end">
                <Calendar className="w-4 h-4" />
                <span>תאריך יעד</span>
              </div>
              <div className="font-bold text-lg">
                {moment(goal.target_date).format('DD/MM/YYYY')}
              </div>
              {daysUntilTarget !== null && (
                <div className={`text-xs mt-1 ${daysUntilTarget < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                  {daysUntilTarget < 0 
                    ? `עבר לפני ${Math.abs(daysUntilTarget)} ימים`
                    : `עוד ${daysUntilTarget} ימים`
                  }
                </div>
              )}
            </div>
          )}
        </div>

        {requiredMonthly && !goal.is_completed && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-right">
            <div className="flex items-center gap-2 justify-end text-purple-700 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold text-sm">חיסכון חודשי נדרש</span>
            </div>
            <div className="font-bold text-xl text-purple-900">
              ₪{requiredMonthly.toLocaleString(undefined, {maximumFractionDigits: 0})}
            </div>
            {goal.monthly_contribution && (
              <div className="text-xs text-gray-600 mt-1">
                תרומה מתוכננת: ₪{goal.monthly_contribution.toLocaleString()}
                {goal.monthly_contribution < requiredMonthly && (
                  <span className="text-red-600"> (לא מספיק!)</span>
                )}
              </div>
            )}
          </div>
        )}

        {goal.ai_recommendations && (
          <div className="p-3 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg text-right">
            <div className="flex items-center gap-2 justify-end text-purple-700 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold text-sm">המלצות AI</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{goal.ai_recommendations}</p>
          </div>
        )}

        {!goal.is_completed && (
          <Button
            onClick={() => onGetRecommendations(goal)}
            disabled={isGenerating}
            variant="outline"
            className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Sparkles className="w-4 h-4 ml-2" />
            {isGenerating ? 'מייצר המלצות...' : 'קבל המלצות AI להשגת המטרה'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}