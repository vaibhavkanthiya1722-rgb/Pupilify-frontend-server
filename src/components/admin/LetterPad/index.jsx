import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PriOverviewService from '../../../services/PriOverviewService';

function LetterPad({
  schoolId,
  user,
  onToast,
  onClose,
  academicYearId
}) {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const [logoError, setLogoError] = useState(false);
  const letterRef = useRef();
  const editorRef = useRef(null);

  // Font customization state
  const [fontSettings, setFontSettings] = useState({
    fontFamily: isHindi ? "'Noto Sans Devanagari', 'Mangal', 'Arial', sans-serif" : "'Times New Roman', Times, serif",
    fontSize: '14px',
    lineHeight: '1.8',
    color: '#000000'
  });

  const [showFontControls, setShowFontControls] = useState(false);
  const letterheadStorageKey = `letterhead-codes-${schoolId || 'default'}`;
  const [letterheadCodes, setLetterheadCodes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(letterheadStorageKey)) || {
        diseCode: '',
        registrationNumber: '',
        recognitionCode: ''
      };
    } catch (error) {
      console.error('Unable to load letterhead codes:', error);
      return { diseCode: '', registrationNumber: '', recognitionCode: '' };
    }
  });

  useEffect(() => {
    localStorage.setItem(letterheadStorageKey, JSON.stringify(letterheadCodes));
  }, [letterheadCodes, letterheadStorageKey]);

  
  const fontOptions = {
  serif: [
    {
      label: isHindi ? 'टाइम्स न्यू रोमन' : 'Times New Roman',
      value: "'Times New Roman', Times, serif"
    },
    {
      label: isHindi ? 'जॉर्जिया' : 'Georgia',
      value: "'Georgia', serif"
    },
    {
      label: isHindi ? 'गारामोंड' : 'Garamond',
      value: "'Garamond', serif"
    },
    {
      label: isHindi ? 'पालाटिनो' : 'Palatino',
      value: "'Palatino', serif"
    }
  ],

  sansSerif: [
    {
      label: isHindi ? 'एरियल' : 'Arial',
      value: "'Arial', sans-serif"
    },
    {
      label: isHindi ? 'हेल्वेटिका' : 'Helvetica',
      value: "'Helvetica', sans-serif"
    },
    {
      label: isHindi ? 'वर्दाना' : 'Verdana',
      value: "'Verdana', sans-serif"
    },
    {
      label: isHindi ? 'ओपन सैन्स' : 'Open Sans',
      value: "'Open Sans', sans-serif"
    }
  ],

  hindi: [
    {
      label: isHindi ? 'नोटो सैन्स देवनागरी' : 'Noto Sans Devanagari',
      value: "'Noto Sans Devanagari', 'Mangal', 'Arial', sans-serif"
    },
    {
      label: isHindi ? 'मंगल' : 'Mangal',
      value: "'Mangal', 'Arial', sans-serif"
    },
    {
      label: isHindi ? 'कृतिदेव' : 'Krutidev',
      value: "'Krutidev', 'Mangal', serif"
    },
    {
      label: isHindi ? 'देवलिस' : 'Devlys',
      value: "'Devlys', 'Mangal', serif"
    }
  ],

  display: [
    {
      label: isHindi ? 'इम्पैक्ट' : 'Impact',
      value: "'Impact', sans-serif"
    },
    {
      label: isHindi ? 'कॉमिक सैन्स एमएस' : 'Comic Sans MS',
      value: "'Comic Sans MS', cursive"
    },
    {
      label: isHindi ? 'कूरियर न्यू' : 'Courier New',
      value: "'Courier New', monospace"
    }
  ]
};

  // School Info
  const schoolName = user?.schoolName ||
    localStorage.getItem('ss_school_name') ||
    t('schoolName');

  const schoolLogo = user?.schoolLogo ||
    localStorage.getItem('ss_school_logo') ||
    user?.school?.logo;

  const logoUrl = schoolLogo ? PriOverviewService.getLogoUrl(schoolLogo) : null;

  // Letter content - using ref to track content without causing re-renders
  const letterContentRef = useRef('');

  const handleFontChange = (setting, value) => {
    setFontSettings(prev => ({ ...prev, [setting]: value }));
  };

  // Rich text formatting functions
  const formatText = (command, value = null) => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    document.execCommand(command, false, value);

    // Update ref without triggering re-render
    letterContentRef.current = editorRef.current.innerHTML;
  };

  const handleEditorChange = () => {
    if (!editorRef.current) return;

    // Only update ref, don't force re-render
    letterContentRef.current = editorRef.current.innerHTML;
  };

  const handlePrint = () => {
    letterContentRef.current = editorRef.current.innerHTML;
    if (!letterRef.current) return;

    const printContent = letterRef.current.innerHTML;
    const documentTitle = `Letter_${new Date().toISOString().slice(0, 10)}`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${documentTitle}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Times New Roman', Times, serif; 
                margin: 40px;
                background: white;
                color: #000;
              }
              .letter-container { 
                max-width: 794px;
                margin: 0 auto;
                padding: 50px 60px;
                background: white;
                border: 1px solid #e2e8f0;
                min-height: 1123px;
                position: relative;
              }
              .letter-body-content {
                font-family: ${fontSettings.fontFamily} !important;
                font-size: ${fontSettings.fontSize} !important;
                line-height: ${fontSettings.lineHeight} !important;
                color: ${fontSettings.color} !important;
              }
              @media print {
                body { margin: 0; padding: 20px; }
                .letter-container { border: none; padding: 40px 50px; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const hindiStyle = isHindi ? {
    fontFamily: "'Noto Sans Devanagari', 'Mangal', 'Arial', sans-serif"
  } : {};

  // Function to wrap text in C shape (half circle) - FIXED
  const getCShapeText = (text) => {
    if (!text) return null;

    // Calculate dynamic font size based on text length
    let fontSize = 22;
    const textLength = text.length;
    if (textLength > 30) {
      fontSize = 16;
    } else if (textLength > 25) {
      fontSize = 18;
    } else if (textLength > 20) {
      fontSize = 20;
    } else if (textLength > 15) {
      fontSize = 22;
    } else {
      fontSize = 24;
    }

    // For Hindi text, use slightly smaller font
    if (isHindi) {
      fontSize = fontSize * 0.85;
    }

    // Adjust path width based on text length
    const pathWidth = Math.min(450, Math.max(350, textLength * 10 + 100));
    const startX = (450 - pathWidth) / 2;
    const endX = startX + pathWidth;

    return (
      <svg
        width="450"
        height="130"
        viewBox="0 0 450 130"
        style={{
          overflow: "visible",
        }}
      >
        <defs>
          <path
            id="schoolArc"
            d={`M${startX + 10},115 Q225,-10 ${endX - 10},115`}
            fill="transparent"
          />
        </defs>

        <text
          fill="#cc0000"
          fontSize={fontSize}
          fontWeight="700"
          fontFamily={isHindi ? "'Noto Sans Devanagari','Mangal',sans-serif" : "Times New Roman, serif"}
          letterSpacing="2"
          textAnchor="middle"
        >
          <textPath
            href="#schoolArc"
            startOffset="50%"
            textLength={textLength * (fontSize * 0.6)}
          >
            {text.toUpperCase()}
          </textPath>
        </text>
      </svg>
    );
  };

  return (
    <div className="letter-pad-wrapper" style={{ padding: '20px' }}>
      {/* Toolbar */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e3a5f' }}>
            📄 {t('letterPad')}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Font Controls Toggle */}
          <button
            onClick={() => setShowFontControls(!showFontControls)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              background: showFontControls ? '#1e3a5f' : 'white',
              color: showFontControls ? 'white' : '#333',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🔤 {t('fontSettings')}
          </button>
          <button
            className="pri-btn pri-btn-primary"
            onClick={handlePrint}
            style={{
              background: '#1e3a5f',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🖨️ {t('print')}
          </button>
          <button
            className="pri-btn pri-btn-ghost"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            ✕ {t('close')}
          </button>
        </div>
      </div>

      {/* Font Controls Panel */}
      <div className="no-print" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        maxWidth: '794px',
        margin: '0 auto 20px',
        padding: '16px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        background: 'white'
      }}>
        {[
          ['diseCode', t('diseCode')],
          ['registrationNumber', t('registrationNumber')],
          ['recognitionCode', t('recognitionCode')]
        ].map(([key, label]) => (
          <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#555' }}>
            {label}
            <input
              type="text"
              value={letterheadCodes[key]}
              onChange={(event) => setLetterheadCodes((current) => ({ ...current, [key]: event.target.value }))}
              placeholder={label}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}
            />
          </label>
        ))}
      </div>

      {showFontControls && (
        <div className="no-print" style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px',
          maxWidth: '794px',
          margin: '0 auto 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          {/* Body Font */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>
              {t('selectFont')}
            </label>
            <select
              value={fontSettings.fontFamily}
              onChange={(e) => handleFontChange('fontFamily', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '13px'
              }}
            >
              <optgroup label={t('admitFontSerif')}>
                {fontOptions.serif.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </optgroup>
              <optgroup label={t('admitFontSansSerif')}>
                {fontOptions.sansSerif.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </optgroup>
              {isHindi && (
                <optgroup label={t('admitFontHindi')}>
                  {fontOptions.hindi.map(font => (
                    <option key={font.value} value={font.value}>{font.label}</option>
                  ))}
                </optgroup>
              )}
              <optgroup label={t('admitFontDisplay')}>
                {fontOptions.display.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>
              {t('fontSize')}
            </label>
            <input
              type="range"
              min="10"
              max="28"
              step="0.5"
              value={parseFloat(fontSettings.fontSize)}
              onChange={(e) => handleFontChange('fontSize', e.target.value + 'px')}
              style={{ width: '100%' }}
            />
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
              {fontSettings.fontSize}
            </div>
          </div>

          {/* Line Height */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>
              {t('lineHeight')}
            </label>
            <input
              type="range"
              min="1.2"
              max="3.5"
              step="0.1"
              value={parseFloat(fontSettings.lineHeight)}
              onChange={(e) => handleFontChange('lineHeight', e.target.value)}
              style={{ width: '100%' }}
            />
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
              {fontSettings.lineHeight}
            </div>
          </div>

          {/* Reset Button */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => {
                setFontSettings({
                  fontFamily: isHindi ? "'Noto Sans Devanagari', 'Mangal', 'Arial', sans-serif" : "'Times New Roman', Times, serif",
                  fontSize: '14px',
                  lineHeight: '1.8',
                  color: '#000000'
                });
              }}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                background: '#f5f5f5',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              🔄 {t('resetDefaults')}
            </button>
          </div>
        </div>
      )}

      {/* Formatting Toolbar for selected text */}
      {showFontControls && (
        <div className="no-print" style={{
          background: '#f8f9fa',
          padding: '25px',
          borderRadius: '8px',
          marginBottom: '10px',
          maxWidth: '794px',
          margin: '0 auto 10px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginRight: '10px' }}>
            {t('formatSelectedText')}
          </span>
          <button onClick={() => formatText('bold')} style={buttonStyle} title={t('bold')}>
            <b>B</b>
          </button>
          <button onClick={() => formatText('italic')} style={buttonStyle} title={t('italic')}>
            <i>I</i>
          </button>
          <button onClick={() => formatText('underline')} style={buttonStyle} title={t('underline')}>
            <u>U</u>
          </button>
          <button onClick={() => formatText('strikeThrough')} style={buttonStyle} title={t('strikethrough')}>
            <s>S</s>
          </button>
          <div style={{ width: '1px', height: '30px', background: '#ddd' }} />
          <button onClick={() => formatText('fontSize', '5')} style={buttonStyle} title={t('increaseFontSize')}>
            A+
          </button>
          <button onClick={() => formatText('fontSize', '1')} style={buttonStyle} title={t('decreaseFontSize')}>
            A-
          </button>
          <div style={{ width: '1px', height: '30px', background: '#ddd' }} />
          <button onClick={() => formatText('foreColor', '#ff0000')} style={{...buttonStyle, color: '#ff0000'}} title={t('redText')}>
            A
          </button>
          <button onClick={() => formatText('foreColor', '#0000ff')} style={{...buttonStyle, color: '#0000ff'}} title={t('blueText')}>
            A
          </button>
          <button onClick={() => formatText('foreColor', '#008000')} style={{...buttonStyle, color: '#008000'}} title={t('greenText')}>
            A
          </button>
          <button onClick={() => formatText('foreColor', '#000000')} style={{...buttonStyle, color: '#000000'}} title={t('blackText')}>
            A
          </button>
          <div style={{ width: '1px', height: '30px', background: '#ddd' }} />
          <button onClick={() => formatText('insertUnorderedList')} style={buttonStyle} title={t('bulletList')}>
            • List
          </button>
          <button onClick={() => formatText('insertOrderedList')} style={buttonStyle} title={t('numberedList')}>
            1. List
          </button>
          <button onClick={() => formatText('justifyLeft')} style={buttonStyle} title={t('alignLeft')}>
            ⬅
          </button>
          <button onClick={() => formatText('justifyCenter')} style={buttonStyle} title={t('alignCenter')}>
            ⬛
          </button>
          <button onClick={() => formatText('justifyRight')} style={buttonStyle} title={t('alignRight')}>
            ➡
          </button>
        </div>
      )}

      {/* Letter Content */}
      <div
        ref={letterRef}
        className="letter-container"
        style={{
          background: 'white',
          padding: '50px 60px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          maxWidth: '794px',
          minHeight: '1123px',
          margin: '0 auto',
          border: '1px solid #d0d7de',
          position: 'relative',
          fontFamily: isHindi ? "'Noto Sans Devanagari', 'Mangal', 'Times New Roman', serif" : "'Times New Roman', Times, serif"
        }}
      >
        {/* Letterhead - Logo Left, C Shape Name Right */}
        <div style={{
          borderBottom: '3px solid #1e3a5f',
          paddingBottom: '15px',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          position: 'relative',
          paddingTop: '48px',
          ...hindiStyle
        }}>
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '0',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            color: '#1e3a5f',
            fontSize: '11px',
            fontWeight: '600',
            textAlign: 'left',
            ...hindiStyle
          }}>
            {letterheadCodes.diseCode && <span>{t('diseCode')}: {letterheadCodes.diseCode}</span>}
            {letterheadCodes.registrationNumber && <span>{t('registrationNumber')}: {letterheadCodes.registrationNumber}</span>}
            {letterheadCodes.recognitionCode && <span>{t('recognitionCode')}: {letterheadCodes.recognitionCode}</span>}
          </div>

          {/* Logo - Left Side */}
          <div style={{ flexShrink: 0 }}>
            {logoUrl && !logoError ? (
              <img
                src={logoUrl}
                alt={t('schoolLogo')}
                onError={() => setLogoError(true)}
                style={{
                  maxHeight: '80px',
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <span style={{ fontSize: '50px' }}>🏫</span>
            )}
          </div>

          {/* School Info with C Shape */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            {/* C Shape School Name - Red */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{
                position: 'relative',
                width: "450px",
                height: "30px",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* C Shape Text */}
                <div style={{
                  position: "absolute",
                  width: "450px",
                  height: "130px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 1,
                }}>
                  {getCShapeText(schoolName)}
                </div>

              </div>
            </div>

            {/* School Details Below */}
            <div>
             
              <p style={{ color: '#555', fontSize: isHindi ? '12px' : '11px', margin: '2px 0' }}>
                {user?.schoolAddress || user?.school?.address || t('schoolAddress')}
              </p>
              <p style={{ color: '#555', fontSize: isHindi ? '12px' : '11px', margin: '2px 0' }}>
                📧 {user?.schoolEmail || user?.school?.mailId || t('email')} |
                📞 {user?.schoolPhone || user?.school?.phoneNumber || t('phone')}
              </p>
            </div>
          </div>

          {/* Right Side - Empty */}
          <div style={{ flexShrink: 0, width: '60px' }} />
        </div>

        {/* Rich Text Editor Body - Only selected text can be formatted */}
        <div style={{ ...hindiStyle }}>
          <div style={{ marginBottom: '20px' }}>
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorChange}
              className="letter-body-content"
              style={{
                width: '100%',
                minHeight: '800px',
                border: '1px dotted #ccc',
                borderRadius: '4px',
                padding: '12px',
                fontFamily: fontSettings.fontFamily,
                fontSize: fontSettings.fontSize,
                lineHeight: fontSettings.lineHeight,
                color: fontSettings.color,
                outline: 'none',
                background: '#fafafa',
                overflowY: 'auto'
              }}
              placeholder={t('writeLetterHere')}
            />
          </div>      
        </div>
      </div>
    </div>
  );
}

// Button style helper
const buttonStyle = {
  padding: '6px 12px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  background: 'white',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  minWidth: '35px',
  transition: 'all 0.2s'
};

export default LetterPad;