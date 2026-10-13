import React from 'react';
import TeacherIDCards from './TeacherIDCards/index';
import StudentIDCards from './StudentIDCards/index';

function IDCards({ 
  schoolId, 
  token, 
  user, 
  onToast, 
  mode = 'idcards',
  onGenerateTC,
  academicYearId,
  entityType = 'student'
}) {
  
  if (entityType === 'student') {
    return (
      <StudentIDCards
        schoolId={schoolId}
        token={token}
        user={user}
        onToast={onToast}
        mode={mode}
        onGenerateTC={onGenerateTC}
        academicYearId={academicYearId}
      />
    );
  } else {
    return (
      <TeacherIDCards
        schoolId={schoolId}
        token={token}
        user={user}
        onToast={onToast}
      />
    );
  }
}

export default IDCards;