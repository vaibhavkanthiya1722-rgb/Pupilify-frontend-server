import React from 'react';

const SectionBadge = ({ section }) => (
  <span className="pri-class-badge">
    {(!section || !section.sectionName) ? 'Section A' : section.sectionName}
  </span>
);

export default SectionBadge;