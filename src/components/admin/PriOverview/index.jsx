import React, { useState, useEffect, useCallback, useMemo } from "react";
import PriOverviewController from "./PriOverviewController";
import PriAutocompleteSelect from "../../common/PriAutocompleteSelect";
import NoteService from "../../../services/NoteService";
import { useTranslation } from 'react-i18next';
import DeleteButton from "../../../components/common/DeleteButton";

const BANNER_IMAGE = "/images/banner.png";

function PriOverview({ user, counts, onNav }) {
  const { t } = useTranslation(); 

  const { cards, quickAccessCards, logoUrl, isDepartment, hasPermission } = PriOverviewController(user, counts);

  const visibleCards = isDepartment 
    ? cards.filter(card => hasPermission(card.permission))
    : cards;
    
  const visibleQuickAccess = isDepartment
    ? quickAccessCards.filter(card => hasPermission(card.permission))
    : quickAccessCards;

  const schoolName = user?.schoolName || 
                     user?.school?.name ||
                     localStorage.getItem('ss_school_name') || 
                     t('yourSchool');

  const schoolId = user?.schoolId || user?.school?.id || localStorage.getItem('ss_school_id');

  // State for announcements from API
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', type: 'info' });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // 🔥 Announcement type options for dropdown - useMemo to prevent re-creation
  const announcementTypes = useMemo(() => [
    { id: 'info', name: '📘 ' + t('information') },
    { id: 'important', name: '⚠️ ' + t('important') },
    { id: 'reminder', name: '🔔 ' + t('reminder') }
  ], [t]);

  // 🔥 Get selected type - useMemo to prevent re-creation
  const selectedType = useMemo(() => {
    return announcementTypes.find(t => t.id === newAnnouncement.type) || announcementTypes[0];
  }, [announcementTypes, newAnnouncement.type]);

  // Load announcements from API
  const loadAnnouncements = useCallback(async () => {
    if (!schoolId) {
      console.warn("No schoolId available");
      return;
    }
    
    try {
      setLoading(true);
      const notes = await NoteService.getNotes(schoolId);
      
      const formattedNotes = notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        date: new Date(note.createdAt).toLocaleDateString(),
        type: note.type || 'info',
        priority: note.type === 'important' ? 'high' : note.type === 'reminder' ? 'low' : 'medium'
      }));
      
      setAnnouncements(formattedNotes);
    } catch (err) {
      console.error("Failed to load announcements:", err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  // Load announcements on component mount
  useEffect(() => {
    if (schoolId) {
      loadAnnouncements();
    }
  }, [loadAnnouncements, schoolId]);

  // Create or Update announcement
  const saveAnnouncement = async () => {
    if (!newAnnouncement.title.trim()) {
      alert(t('pleaseEnterAnnouncement'));
      return;
    }
    
    if (!schoolId) {
      alert(t('schoolIdNotFound'));
      return;
    }
    
    try {
      if (editMode) {
        await NoteService.updateNote(schoolId, editId, {
          title: newAnnouncement.title,
          type: newAnnouncement.type
        });
      } else {
        await NoteService.createNote(schoolId, {
          title: newAnnouncement.title,
          type: newAnnouncement.type
        });
      }
      
      await loadAnnouncements();
      setNewAnnouncement({ title: '', type: 'info' });
      setShowAddForm(false);
      setEditMode(false);
      setEditId(null);
      
    } catch (err) {
      console.error("Failed to save announcement:", err);
      alert(err?.response?.data || t('failedToSaveAnnouncement'));
    }
  };

  // Delete announcement
  const deleteAnnouncement = useCallback(async (id) => {
    if (!schoolId) return;
    
    try {
      await NoteService.deleteNote(schoolId, id);
      await loadAnnouncements();
    } catch (err) {
      console.error("Failed to delete announcement:", err);
      alert(err?.response?.data || t('failedToDeleteAnnouncement'));
    }
  }, [schoolId, loadAnnouncements, t]);

  // Edit announcement
  const editAnnouncement = useCallback((ann) => {
    setNewAnnouncement({ title: ann.title, type: ann.type });
    setEditMode(true);
    setEditId(ann.id);
    setShowAddForm(true);
  }, []);

  // 🔥 Handler for announcement type change - useCallback to prevent re-creation
  const handleTypeChange = useCallback((option) => {
    setNewAnnouncement(prev => ({ ...prev, type: option?.id || 'info' }));
  }, []);

  const getTypeColor = useCallback((type) => {
    switch(type) {
      case 'important': return '#ef4444';
      case 'info': return '#3b82f6';
      case 'reminder': return '#f59e0b';
      default: return '#10b981';
    }
  }, []);

  const getTypeIcon = useCallback((type) => {
    switch(type) {
      case 'important': return '⚠️';
      case 'info': return 'ℹ️';
      case 'reminder': return '🔔';
      default: return '📌';
    }
  }, []);

  // Check if any content exists
  const hasMainCards = visibleCards.length > 0;
  const hasQuickAccess = visibleQuickAccess.length > 0;
  const hasAnyContent = hasMainCards || hasQuickAccess;

  // Announcement card component
  const AnnouncementCard = useCallback(({ announcement }) => (
    <div key={announcement.id} className="pri-info-item">
      <div 
        className="pri-info-dot" 
        style={{ background: getTypeColor(announcement.type), boxShadow: `0 0 0 3px ${getTypeColor(announcement.type)}20` }}
      ></div>
      <div className="pri-info-text">
        <div className="pri-info-title">
          <span className="pri-info-type-icon">{getTypeIcon(announcement.type)}</span>
          {announcement.title}
        </div>
        <div className="pri-info-date">{announcement.date}</div>
      </div>
      <div className="pri-td-actions">
        <button 
          className="edit-button"
          onClick={() => editAnnouncement(announcement)}
          title={t("edit")}
        >
          ✏️
        </button>
        <DeleteButton 
          objectId={announcement.id}
          objectName={announcement.title}
          onDelete={deleteAnnouncement}
        />
      </div>
    </div>
  ), [getTypeColor, getTypeIcon, editAnnouncement, deleteAnnouncement, t]);

  // Add/Edit Form Component with dropdown
  const AnnouncementForm = useCallback(() => (
    <div className="pri-modal-body">
      <div className="pri-form-field mb-10">
        <input
          type="text"
          placeholder={t("enterAnnouncement")}
          value={newAnnouncement.title}
          onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
          autoFocus
          className="mb-10"
        />
        {/* 🔥 Announcement Type Dropdown */}
        <PriAutocompleteSelect
          value={selectedType}
          data={announcementTypes}
          onChange={handleTypeChange}
          placeholder={t("selectType")}
          optionLabel="name"
          optionValue="id"
          size="medium"
          clearable={false}
        />
      </div>
      
      <div className="pri-modal-footer">
        <button 
          className="pri-btn pri-btn-primary"
          onClick={saveAnnouncement}
        >
          {editMode ? t("update") : t("save")}
        </button>
        <button 
          className="pri-btn pri-btn-ghost"
          onClick={() => {
            setShowAddForm(false);
            setEditMode(false);
            setNewAnnouncement({ title: '', type: 'info' });
          }}
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  ), [newAnnouncement.title, selectedType, announcementTypes, handleTypeChange, saveAnnouncement, editMode, t]);

  // Announcements List Component
  const AnnouncementsList = useCallback(() => (
    <div className="pri-info-content">
      {loading ? (
        <div className="pri-empty">
          <p>{t("loadingAnnouncements")}</p>
        </div>
      ) : announcements.length > 0 ? (
        announcements.map(ann => <AnnouncementCard key={ann.id} announcement={ann} />)
      ) : (
        <div className="pri-empty">
          <span>📭</span>
          <p>{t("noAnnouncementsYet")}</p>
          <p>{t("createFirstAnnouncement")}</p>       
        </div>
      )}
    </div>
  ), [loading, announcements, AnnouncementCard, t]);

  // Announcements Section Component
  const AnnouncementsSection = useCallback(({ fullWidth = false }) => (
    <div className={fullWidth ? "pri-quick-access-info" : "pri-quick-access-info"} style={fullWidth ? { width: '100%', marginTop: '20px' } : {}}>
      <div className="pri-info-header">
        <span className="pri-info-header-icon">📢</span>
        <span className="pri-info-header-title">{t("schoolAnnouncements")}</span>
        <button 
          className="pri-btn pri-btn-primary"
          onClick={() => {
            setShowAddForm(prev => !prev);
            if (!showAddForm) {
              setEditMode(false);
              setNewAnnouncement({ title: '', type: 'info' });
            }
          }}
        >
          {showAddForm ? '✕' : `+ ${t("add")}`}
        </button>
      </div>
      
      {showAddForm && <AnnouncementForm />}
      <AnnouncementsList />
    </div>
  ), [showAddForm, AnnouncementForm, AnnouncementsList, t]);

  return (
    <div className="pri-content">
      <div 
        className="pri-banner" 
        style={{ 
          backgroundImage: `url(${BANNER_IMAGE})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div>
          <div className="pri-banner-emoji">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="school-logo" 
                style={{ 
                  width: "60px", 
                  height: "60px", 
                  objectFit: "contain", 
                  borderRadius: "12px", 
                  background: "#fff", 
                  padding: "5px" 
                }}
                onError={(e) => { 
                  e.target.style.display = "none"; 
                  e.target.parentElement.innerHTML = "🏫"; 
                }} 
              />
            ) : "🏫"}
          </div>
          <div className="pri-banner-sub">
            {isDepartment ? t("departmentDashboard") : t("principalDashboard")}
          </div>
          <div className="pri-banner-name">{schoolName}</div>
          <div className="pri-banner-id">
            {isDepartment 
              ? `${t('welcome')} ${user?.departmentName || user?.department?.name || t('department')}!` 
              : t("welcomeBack")}
          </div>
          {isDepartment && (user?.departmentType || user?.department?.type) && (
            <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '5px' }}>
              {user?.departmentType || user?.department?.type} {t('department')}
            </div>
          )}
        </div>
      </div>

      {hasAnyContent ? (
        <>
          {hasMainCards && (
            <div className="pri-stats">
              {visibleCards.map((s) => (
                <div 
                  key={s.label} 
                  className={`pri-stat ${s.cls}`} 
                  onClick={() => onNav(s.key)} 
                  style={{ cursor: 'pointer' }}
                >
                  <div className="pri-stat-icon">{s.icon}</div>
                  <div className="pri-stat-val">{s.val ?? 0}</div>
                  <div className="pri-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {hasQuickAccess ? (
            <div className="pri-quick-access-wrapper">
              <div className="pri-quick-access-modules">
                <div className="pri-quick-access-title">
                  <span>⚡ {t("quickAccess")}</span>                
                </div>
                <div className="pri-modules-grid">
                  {visibleQuickAccess.map((s) => (
                    <div 
                      key={s.label} 
                      className={`pri-module-card ${s.cls}`} 
                      onClick={() => onNav(s.key)} 
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="pri-module-icon">{s.icon}</div>
                      <div className="pri-module-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <AnnouncementsSection />
            </div>
          ) : (
            <AnnouncementsSection fullWidth={true} />
          )}
        </>
      ) : (
        <div className="pri-card" style={{ textAlign: 'center', padding: '40px' }}>
          <h3>{t("welcomeDepartmentPortal")}</h3>
          <p>{t("noModulesAssigned")}</p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            {t("contactAdministrator")}
          </p>
        </div>
      )}
    </div>
  );
}

export default PriOverview;