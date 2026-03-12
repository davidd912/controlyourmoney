import React from 'react';
import MobileSelect from '@/components/budget/MobileSelect';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '@/components/i18n';

export default function HouseholdSelector({ households, selectedId, onSelect, currentUserEmail }) {
  if (households.length <= 1) return null;

  const options = households.map((household) => {
    const isOwner = household.owner_email === currentUserEmail;
    const memberCount = household.members?.length || 0;
    
    let label = household.name;
    if (memberCount > 1) label += ` (${memberCount} חברים)`;
    if (isOwner) label += ' - בעלים';
    
    return {
      value: household.id,
      label: label
    };
  });

  return (
    <div className="mb-6">
      <MobileSelect
        value={selectedId || ''}
        onValueChange={onSelect}
        placeholder="בחר משק בית"
        label="בחר משק בית"
        options={options}
      />
    </div>
  );
}