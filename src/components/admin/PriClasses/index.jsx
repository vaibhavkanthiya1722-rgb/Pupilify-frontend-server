import React from "react";
import PriModal from "../PriModal";
import PriClassesController from "./PriClassesController";
import DeleteButton from "../../../components/common/DeleteButton";
import { useTranslation } from 'react-i18next';

function PriClasses({ schoolId, token, classes, sections, onRefresh, onToast }) {
  const { t } = useTranslation();

  const {
    // State
    modal, setModal,
    sectionModal, setSectionModal,
    selectedClassId, setSelectedClassId,
    expandedClass,
    className, setClassName,
    sectionName, setSectionName,
    loading,

    // Data
    totalClasses,
    totalSections,

    // Functions
    handleCreateClass,
    handleDeleteClass,
    handleAddSection,
    handleDeleteSection,
    getSelectedClassName,
    getClassSections,
    toggleClass,
    closeClassModal,
    closeSectionModal

  } = PriClassesController({
    schoolId,
    classes,
    sections,
    onToast,
    onRefresh,
    t  // ← Pass translation function to controller
  });

  // Wrapper for class delete to handle the actual deletion
  const handleClassDelete = async (classId) => {
    const cls = classes.find(c => String(c.id) === String(classId));
    if (cls) {
      await handleDeleteClass(classId, cls.className);
    }
  };

  // Wrapper for section delete to handle the actual deletion  
  const handleSectionDelete = async (sectionId) => {
    // Find section details from current state
    const section = sections.find(s => String(s.id) === String(sectionId));
    if (section) {
      await handleDeleteSection(sectionId, section.sectionName, section.classId);
    }
  };

  return (
    <div className="pri-content">
      <div className="pri-classes-header">
        <div className="mb">
          <div className="content-heading">📚 {t("classesAndSections")}</div>
          <div className="content-text">
            {totalClasses} {t("classes")} • {totalSections} {t("sections")}
          </div>
        </div>

        {/* Two buttons side by side */}
        <div className="d-flex gap-8">
          <button className="pri-btn pri-btn-primary" onClick={() => setModal(true)}>
            + {t("addClass")}
          </button>

          <button
            className="pri-btn pri-btn-secondary"
            onClick={() => {
              if (classes.length === 0) {
                onToast?.(t("pleaseCreateClassFirst"), 'info');
                return;
              }
              setSelectedClassId('');
              setSectionModal(true);
            }}
          >
            + {t("addSection")}
          </button>
        </div>
      </div>

      {/* Classes Display - Accordion Style */}
      <div className="pri-card">
        <div className="table-wrap">
          <table className="pri-table">
            <thead>
              <tr>
                <th>{t("class")}</th>
                <th>{t("sections")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className="pri-empty">
                      <div className="pri-empty-icon">📚</div>
                      <p>{t("noClassesYet")}</p>
                    </div>
                   </td>
                 </tr>
              ) : (
                classes.map((cls) => {
                  const classSections = getClassSections(cls.id);
                  const isExpanded = expandedClass === cls.id;

                  return (
                    <React.Fragment key={cls.id}>
                      {/* Main Class Row */}
                      <tr className={`class-row ${isExpanded ? "expanded" : ""}`}>
                        <td onClick={() => toggleClass(cls.id)}>
                          <div className="class-cell">
                            <span className={`arrow ${isExpanded ? "rotate" : ""}`}>
                              ▶
                            </span>
                            <strong className="class-name">{cls.className}</strong>
                          </div>
                        </td>

                        <td onClick={() => toggleClass(cls.id)}>
                          {!isExpanded && (
                            <div className="section-preview">
                              {classSections.length > 0 ? (
                                <>
                                  {classSections.slice(0, 2).map(sec => (
                                    <span key={sec.id} className="section-chip">
                                      {sec.sectionName}
                                    </span>
                                  ))}
                                  {classSections.length > 2 && (
                                    <span className="more-count">
                                      +{classSections.length - 2} {t("more")}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="no-section-text">{t("noSections")}</span>
                              )}
                            </div>
                          )}
                        </td>

                        <td>
                          {/* DeleteButton handles its own confirmation */}
                          <DeleteButton
                            objectId={cls.id}
                            objectName={cls.className}
                            onDelete={handleClassDelete}
                            itemType="Class"
                            title={t("deleteClass")}
                          />
                        </td>
                      </tr>

                      {/* Expanded Sections Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={3}>
                            <div className="expanded-header">
                              <h4>
                                {t("sectionsIn")} {cls.className}
                              </h4>
                              <button
                                className="btn-add-section pri-btn-secondary"
                                onClick={() => {
                                  setSelectedClassId(cls.id);
                                  setSectionModal(true);
                                }}
                              >
                                + {t("addSection")}
                              </button>
                            </div>

                            {classSections.length === 0 ? (
                              <div className="no-section-box">
                                <p>{t("noSectionsYet")}</p>
                              </div>
                            ) : (
                              <div className="section-list">
                                {classSections.map(sec => (
                                  <div key={sec.id} className="section-item">
                                    <div className="section-left">
                                      <span className="section-badge">
                                        {sec.sectionName}
                                      </span>
                                    </div>
                                    {/* DeleteButton for section - handles its own confirmation */}
                                    <DeleteButton
                                      objectId={sec.id}
                                      objectName={`${t("section")} ${sec.sectionName}`}
                                      onDelete={handleSectionDelete}
                                      itemType="Section"
                                      title={t("delete")}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Class Modal */}
      {modal && (
        <PriModal
          title={`📚 ${t("addNewClass")}`}
          onClose={closeClassModal}
          footer={
            <>
              <button className="pri-btn pri-btn-ghost" onClick={closeClassModal}>
                {t("cancel")}
              </button>
              <button
                className="pri-btn pri-btn-primary"
                onClick={handleCreateClass}
                disabled={loading}
              >
                {loading ? t("creating") : t("createClass")}
              </button>
            </>
          }
        >
          <div className="pri-form-field">
            <label>{t("className")} *</label>
            <input
              value={className}
              onChange={e => setClassName(e.target.value)}
              placeholder={t("classNamePlaceholder")}
              autoFocus
            />
          </div>
        </PriModal>
      )}

      {/* Add Section Modal */}
      {sectionModal && (
        <PriModal
          title={`➕ ${t("addNewSection")}`}
          onClose={closeSectionModal}
          footer={
            <>
              <button className="pri-btn pri-btn-ghost" onClick={closeSectionModal}>
                {t("cancel")}
              </button>
              <button
                className="pri-btn pri-btn-primary"
                onClick={handleAddSection}
                disabled={loading}
              >
                {loading ? t("adding") : t("addSection")}
              </button>
            </>
          }
        >
          <div className="pri-form-field mb-10">
            <label>{t("selectClass")} *</label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
            >
              <option value="">{t("chooseClass")}</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>

          <div className="pri-form-field mb-10">
            <label>{t("sectionName")} *</label>
            <input
              value={sectionName}
              onChange={e => setSectionName(e.target.value)}
              placeholder={t("sectionNamePlaceholder")}
              autoFocus
            />
          </div>

          {selectedClassId && getClassSections(selectedClassId).length > 0 && (
            <div className="warning-box">
              <div className="mb-10">{t("existingSectionsIn")} {getSelectedClassName()}:</div>
              {getClassSections(selectedClassId).map(sec => (
                <span key={sec.id} className="pri-class-badge">
                  {sec.sectionName}
                </span>
              ))}
            </div>
          )}
        </PriModal>
      )}
    </div>
  );
}

export default PriClasses;