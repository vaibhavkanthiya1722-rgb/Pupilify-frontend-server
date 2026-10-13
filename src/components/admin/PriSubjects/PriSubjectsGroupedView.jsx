import React from 'react';
import DeleteButton from '../../common/DeleteButton';
import TableSkeleton from '../../loaders/TableSkeleton';

function PriSubjectsGroupedView({ 
  groupedByClassSection, 
  expandedGroups, 
  toggleGroup, 
  deleteSubject, 
  loading, 
  t 
}) {
  const groupEntries = Object.entries(groupedByClassSection);

  if (loading) {
    return <TableSkeleton rows={5} columns={6} />;
  }

  if (groupEntries.length === 0) {
    return (
      <div className="pri-empty">
        <div className="pri-empty-icon">📖</div>
        <p>{t('noSubjectsFound')}</p>
      </div>
    );
  }

  return (
    <div>
      {groupEntries.map(([groupKey, groupData]) => {
        const isExpanded = expandedGroups[groupKey];

        return (
          <div key={groupKey}>
            <div
              onClick={() => toggleGroup(groupKey)}
              className="pri-topbar"         
            >
              <div className="common">
                <span>{groupData.sectionName ? '📘' : '📚'}</span>
                <div>
                  <h3>
                    {groupData.className}
                    {groupData.sectionName && (
                      <span> - {groupData.sectionName}</span>
                    )}
                    {!groupData.sectionName && (
                      <span className="section-badge margin">
                        {t('classLevelSubjects')}
                      </span>
                    )}
                  </h3>
                  <div className="font-size-10">
                    {groupData.subjects.length} {groupData.subjects.length !== 1 ? t('subjects') : t('subject')}
                  </div>
                </div>
              </div>
              <span className="arrow">
                {isExpanded ? '▼' : '▶'}
              </span>
            </div>

            {isExpanded && (
              <div className="table-wrap">
                <table className="pri-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t('subject')}</th>
                      <th>{t('code')}</th>
                      <th>{t('theoryMarks')}</th>
                      <th>{t('practical')}</th>
                      <th>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupData.subjects.map((s, index) => (
                      <tr key={s.id}>
                        <td>{index + 1}</td>
                        <td>{s.subjectName}</td>
                        <td>
                          <span>
                            {s.subjectCode || '—'}
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
                            <span>
                              {t('noPractical')}
                            </span>
                          )}
                        </td>
                        <td>
                          <DeleteButton
                            objectId={s.id}
                            objectName={s.subjectName}
                            onDelete={deleteSubject}
                            itemType="Subject"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PriSubjectsGroupedView;