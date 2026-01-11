import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, Users } from 'lucide-react';

export default function HouseholdSelector({ households, selectedId, onSelect, currentUserEmail }) {
  if (households.length <= 1) return null;

  return (
    <div className="mb-6">
      <Select value={selectedId || ''} onValueChange={onSelect}>
        <SelectTrigger className="w-full md:w-64">
          <SelectValue placeholder="בחר משק בית" />
        </SelectTrigger>
        <SelectContent>
          {households.map((household) => {
            const isOwner = household.owner_email === currentUserEmail;
            const memberCount = household.members?.length || 0;
            
            return (
              <SelectItem key={household.id} value={household.id}>
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <span>{household.name}</span>
                  {memberCount > 1 && (
                    <span className="text-xs text-gray-500">({memberCount} חברים)</span>
                  )}
                  {isOwner && (
                    <span className="text-xs text-blue-600">בעלים</span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}