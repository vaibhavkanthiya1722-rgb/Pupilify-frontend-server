// src/components/superadmin/Dashboard/SASchools/index.js

import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EditAndViewButton from "../../../common/EditAndViewButton";
import AcademicYearFormModal from "../AcademicYearForm";
import LinkAcademicYearModal from "../LinkAcademicYear";
import SASchoolsController from "./SASchoolsController";
import SchoolDetailModal from "../SchoolDetailModel";
import SchoolFormModal from "../SchoolFormModel";
import DeleteButton from "../../../common/DeleteButton";
import TableSkeleton from "../../../loaders/TableSkeleton";

function SASchools({ schools, onRefresh, onToast, loading }) {
  const { t } = useTranslation(); 

  const {
    search,
    setSearch,
    editModal,
    setEditModal,
    detailModal,
    setDetailModal,
    academicYearModal,
    setAcademicYearModal,
    linkYearModal,
    setLinkYearModal,
    selectedSchoolForYear,
    setSelectedSchoolForYear,
    showSchoolDropdown,
    deleteSchool,
    handleSaved,
    handleAddAcademicYearClick,
    handleSelectSchoolForYear,
    handleLinkAcademicYear
  } = SASchoolsController(onRefresh, onToast);

  // Filter out inactive schools first
  const activeSchools = schools.filter(
    school => school.subscriptionStatus !== "INACTIVE"
  );

  // Then apply search filter
  const filtered = activeSchools.filter(
    (s) =>
      s.schoolName?.toLowerCase().includes(search.toLowerCase()) ||
      s.mailId?.toLowerCase().includes(search.toLowerCase())
  );

  const statusClass = (s) =>
    ({ ACTIVE: "active", TRIAL: "trial", INACTIVE: "inactive" }[s] || "trial");

  // If loading and no schools, show loader
  if (loading && schools.length === 0) {
    return (
      <div className="sa-content">
        <div className="sa-table-header">
          <div>
            <div className="sa-table-name">
              🏫 {t("allSchools")}
              <span>(0 {t("active")})</span>
            </div>
            <div className="sa-table-detail">
              {t("schoolsTableDescription")}
            </div>
          </div>
          <div className="position-relative d-flex gap-10">
            <button className="sa-btn sa-btn-secondary" disabled>
              📅 {t("addAcademicYear")}
            </button>
            <button className="sa-btn sa-btn-primary" disabled>
              + {t("addSchool")}
            </button>
          </div>
        </div>
        <div className="sa-card">
          <div className="sa-card-header">
            <div className="sa-search-wrap">
              <span>🔍</span>
              <input
                className="sa-search-input"
                placeholder={t("searchPlaceholder")}
                disabled
              />
            </div>
            <button className="sa-btn sa-btn-ghost sa-btn-sm" disabled>
              ↻ {t("refresh")}
            </button>
          </div>
          <div className="table-wrap">
            <TableSkeleton rows={6} columns={8} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sa-content">

      {/* HEADER - Show count of active schools */}
      <div className="sa-table-header">
        <div>
          <div className="sa-table-name">
            🏫 {t("allSchools")}
            <span>
              ({activeSchools.length} {t("active")})
            </span>
          </div>

          <div className="sa-table-detail">
            {t("schoolsTableDescription")}
          </div>
        </div>

        <div className="position-relative d-flex gap-10">

          {/* ADD ACADEMIC YEAR - Only show active schools in dropdown */}
          <div className="position-relative">
            <button
              className="sa-btn sa-btn-secondary"
              onClick={handleAddAcademicYearClick}
            >
              📅 {t("addAcademicYear")}
            </button>

            {showSchoolDropdown && (
              <div className="school-dropdown">
                {activeSchools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => handleSelectSchoolForYear(school)}
                    className="school-dropdown-item"
                  >
                    {school.schoolName}
                  </button>
                ))}

                {activeSchools.length === 0 && (
                  <div className="school-dropdown-empty">
                    {t("noActiveSchools")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ADD SCHOOL */}
          <button
            className="sa-btn sa-btn-primary"
            onClick={() => setEditModal("add")}
          >
            + {t("addSchool")}
          </button>
        </div>
      </div>

      {/* CARD */}
      <div className="sa-card">

        {/* SEARCH */}
        <div className="sa-card-header">
          <div className="sa-search-wrap">
            <span>🔍</span>
            <input
              className="sa-search-input"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            className="sa-btn sa-btn-ghost sa-btn-sm"
            onClick={onRefresh}
          >
            ↻ {t("refresh")}
          </button>
        </div>

        {/* TABLE */}
        <div className="table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("school")}</th>
                <th>{t("email")}</th>
                <th>{t("phone")}</th>
                <th>{t("status")}</th>
                <th>{t("academicYear")}</th>
                <th>{t("created")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center">
                    {activeSchools.length === 0
                      ? t("noActiveSchoolsFound")
                      : t("noSchoolsMatchSearch")}
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-10">
                        <div className="sa-school-avatar">
                          {s.schoolName?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <Link
                            to={`/schools/${s.id}`}
                            className="sa-link"
                            onClick={(e) => {
                              e.preventDefault();
                              setDetailModal(s);
                            }}
                          >
                            {s.schoolName}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td>{s.mailId}</td>
                    <td>{s.phoneNumber || "—"}</td>

                    <td>
                      <span className={`sa-status ${statusClass(s.subscriptionStatus)}`}>
                        {t(s.subscriptionStatus?.toLowerCase() || "trial")}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex gap-8 align-items-center">
                        <button
                          className="sa-btn sa-btn-ghost sa-btn-sm"
                          onClick={() => handleLinkAcademicYear(s)}
                        >
                          🔗 {t("linkYear")}
                        </button>
                      </div>
                    </td>

                    <td>
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>

                    <td>
                      <div className="sa-td-actions">
                        <EditAndViewButton
                          icon="👁️"
                          toolTipTitle={t("viewDetails")}
                          onClick={() => setDetailModal(s)}
                        />

                        <EditAndViewButton
                          icon="✏️"
                          toolTipTitle={t("editSchool")}
                          onClick={() => setEditModal(s)}
                        />

                        <DeleteButton
                          objectId={s.id}
                          objectName={s.schoolName}
                          onDelete={deleteSchool}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {editModal && (
        <SchoolFormModal
          school={editModal === "add" ? null : editModal}
          onClose={() => setEditModal(null)}
          onSaved={handleSaved}
        />
      )}

      {academicYearModal && selectedSchoolForYear && (
        <AcademicYearFormModal
          school={selectedSchoolForYear}
          onClose={() => {
            setAcademicYearModal(null);
            setSelectedSchoolForYear(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {linkYearModal && selectedSchoolForYear && (
        <LinkAcademicYearModal
          school={selectedSchoolForYear}
          onClose={() => {
            setLinkYearModal(null);
            setSelectedSchoolForYear(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {detailModal && (
        <SchoolDetailModal
          school={detailModal}
          onClose={() => setDetailModal(null)}
          onToast={onToast}
        />
      )}

    </div>
  );
}

export default SASchools;