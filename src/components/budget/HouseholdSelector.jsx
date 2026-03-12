import React from 'react';
import MobileSelect from '@/components/budget/MobileSelect';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '@/components/i18n';

export default function HouseholdSelector({ households, selectedId, onSelect, currentUserEmail }) {
  const { t } = useTranslation();
  if (households.length <= 1) return null;

  const options = households.map((household) => {
    const isOwner = household.owner_email === currentUserEmail;
    const memberCount = household.members?.length || 0;
    
    let label = household.name;
    if (memberCount > 1) label += ` (${memberCount} ${t('owner_suffix').replace('בעלים', t('members_count', { count: memberCount }).replace(` (${memberCount} חברים)`, 'חברים'))})`;
    if (isOwner) label += ` - ${t('owner_suffix')}`;
    
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
        placeholder={t('select_household')}
        label={t('select_household')}
        options={options}
      />
    </div>
  );
}