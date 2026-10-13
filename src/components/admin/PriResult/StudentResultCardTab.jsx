import React from 'react';
import { useTranslation } from 'react-i18next';

const StudentResultCardTab = ({ 
  studentSearch, 
  setStudentSearch, 
  loading, 
  onLoadStudentCard 
}) => {
  const { t } = useTranslation(); 
  
  return (
    <div className="pri-card" >
      <div className="pri-card pd-24">
        <h3 className="mb">
          🎓 {t("studentResultCard")}
        </h3>
        
        <div className="pri-form-row">
          <div className="pri-form-field">
            <label>
              {t("studentRollNumber")} *
            </label>
            <input
              type="text"
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              placeholder={t("enterRollNumber")}
              onKeyDown={e => e.key === 'Enter' && onLoadStudentCard()}
            />
          </div>
          <div className="d-flex justify-content-end mt-20">
            <button
              className="pri-btn pri-btn-primary"
              onClick={onLoadStudentCard}
              disabled={loading}
              onMouseEnter={e => {
                if (!loading) e.target.style.backgroundColor = '#5a6fcc';
              }}
              onMouseLeave={e => {
                if (!loading) e.target.style.backgroundColor = '#464b9b';
              }}
            >
              {loading ? `⏳ ${t("loading")}` : `🔍 ${t("loadResult")}`}
            </button>
          </div>
        </div>

        <div className='warning-box'>
          <p>
            ℹ️ {t("pleaseSelectClassAndExamNameBeforeSearching")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentResultCardTab;