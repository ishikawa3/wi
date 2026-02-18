import React from 'react';

/**
 * Profile selector component
 */
const ProfileSelector = ({ profiles, selected, onChange }) => {
  return (
    <select
      id="profile-select"
      value={selected || ''}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '8px',
        fontSize: '14px',
        borderRadius: '4px',
        border: '1px solid #ccc'
      }}
    >
      <option value="">プロファイルを選択</option>
      {profiles.map((profile) => (
        <option key={profile.id} value={profile.id}>
          {profile.name}
        </option>
      ))}
    </select>
  );
};

export default ProfileSelector;
