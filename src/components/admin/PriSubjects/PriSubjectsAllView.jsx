import React from 'react';
import DeleteButton from '../../common/DeleteButton';
import TableSkeleton from '../../loaders/TableSkeleton';

function PriSubjectsAllView({ subjects, loading, deleteSubject, t }) {
  if (loading) {
    return <TableSkeleton rows={5} columns={8} />;
  }

  if (subjects.length === 0) {
    return (
      <div className="pri-empty">
        <div className="pri-empty-icon">📖</div>
        <p>{t('noSubjectsFound')}</p>
      </div>
    );
  }

  return (
    <table className="pri-table">
      <thead>
        <tr>
          <th>#</th>
          <th>{t('subject')}</th>
          <th>{t('code')}</th>
          <th>{t('class')}</th>
          <th>{t('section')}</th>
          <th>{t('theoryMarks')}</th>
          <th>{t('practical')}</th>
          <th>{t('actions')}</th>
        </tr>
      </thead>
      <tbody>
        {subjects.map((s, i) => (
          <tr key={s.id}>
            <td>{i + 1}</td>
            <td>{s.subjectName}</td>
            <td><span>{s.subjectCode || '—'}</span></td>
            <td>
              <span>
                {s.className || 'N/A'}
              </span>
            </td>
            <td>
              <span>
                {s.sectionName || 'N/A'}
              </span>
            </td>
            <td>
              <span className="pri-badge">
                {s.totalTheoryMarks}/{s.passingTheoryMarks}
              </span>
            </td>
            <td>
              {s.hasPractical ? (
                <span className="pri-badge-green">
                  ✓ {s.totalPracticalMarks}/{s.passingPracticalMarks}
                </span>
              ) : (
                <span className="pri-badge">—</span>
              )}
            </td>
            <td>
              <DeleteButton
                objectId={s.id}
                objectName={s.subjectName}
                onDelete={deleteSubject}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default PriSubjectsAllView;