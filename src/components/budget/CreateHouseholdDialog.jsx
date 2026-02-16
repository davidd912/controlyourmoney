import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CreateHouseholdDialog({
  open,
  onOpenChange,
  newHouseholdName,
  onNewHouseholdNameChange,
  onCreateHousehold,
  isCreating
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl" aria-describedby="create-household-description">
        <DialogHeader>
          <DialogTitle>צור משק בית חדש</DialogTitle>
          <DialogDescription id="create-household-description">
            הזן את שם משק הבית שלך כדי להתחיל לנהל את התקציב המשפחתי
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="household-name">שם משק הבית</Label>
            <Input
              id="household-name"
              value={newHouseholdName}
              onChange={(e) => onNewHouseholdNameChange(e.target.value)}
              placeholder="לדוגמה: משפחת כהן"
              onKeyPress={(e) => e.key === 'Enter' && onCreateHousehold()}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onNewHouseholdNameChange('');
              }}
            >
              ביטול
            </Button>
            <Button
              onClick={onCreateHousehold}
              disabled={!newHouseholdName.trim() || isCreating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? 'יוצר...' : 'צור משק בית'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}