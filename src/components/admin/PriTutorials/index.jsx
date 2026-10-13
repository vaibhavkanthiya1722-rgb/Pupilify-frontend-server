import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function PriTutorials({ user, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/overview');
    }
  };

  const handleDownload = () => {
    window.open('/videos/tutorial.mp4', '_blank');
  };

  return (
    <div className="pri-content">
      <div className="pri-tutorials-card">
        <div className="pri-tutorials-header">
          <h2 className="pri-tutorials-title">
            <span className="pri-tutorials-icon">🎬</span>
            {t("videoTutorial") || "Video Tutorial"}
          </h2>
          <p className="pri-tutorials-subtitle">
            {t("watchTutorial") || "Watch this tutorial to learn how to use the application:"}
          </p>
        </div>

        {/* Video Player */}
        <div className="pri-tutorials-video-wrapper">
          <video
            controls
            className="pri-tutorials-video"
            poster="/images/tutorial-poster.png"
          >
            <source src="/videos/tutorial.mp4" type="video/mp4" />
            <source src="/videos/tutorial.webm" type="video/webm" />
            {t("yourBrowserDoesNotSupportVideo") || "Your browser does not support the video tag."}
          </video>
        </div>

        {/* Help Text */}
        <div className="pri-tutorials-help">
          <p>
            <span>💡</span>
            {t("tutorialHelpText") || "If the video doesn't play, please check your internet connection or try a different browser."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pri-tutorials-actions">
          <button 
            className="pri-btn pri-btn-primary"
            onClick={handleBack}
          >
            🏠 {t("backToDashboard") || "Back to Dashboard"}
          </button>
          <button 
            className="pri-btn pri-btn-outline"
            onClick={handleDownload}
          >
            📥 {t("downloadVideo") || "Download Video"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PriTutorials;