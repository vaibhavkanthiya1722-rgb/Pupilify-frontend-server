import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 

const OverviewPage = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const observerRef = useRef(null); // Store observer reference

  // Current Available Features (13 features)
  const currentFeatures = [
    {
      icon: "🏫",
      title: "Multi-School Management",
      description: "Manage multiple schools under state & district hierarchy. Complete control from one dashboard.",
      color: "#3b82f6",
      category: "Core",
      status: "available"
    },
    {
      icon: "👥",
      title: "Role-Based Access",
      description: "Super Admin → State Manager → District Manager → Principal → Teacher/Accountant. Perfect hierarchy.",
      color: "#f59e0b",
      category: "Security",
      status: "available"
    },
    {
      icon: "🪪",
      title: "ID Card Generator",
      description: "Generate professional ID cards for students & teachers with photo, barcode, and all details.",
      color: "#10b981",
      category: "Documents",
      status: "available"
    },
    {
      icon: "📄",
      title: "TC Generation",
      description: "Automatic Transfer Certificate generation with complete student history and signatures.",
      color: "#ef4444",
      category: "Documents",
      status: "available"
    },
    {
      icon: "📅",
      title: "Smart Time Table",
      description: "Class-wise, teacher-wise, and period-wise timetable management with conflict detection.",
      color: "#8b5cf6",
      category: "Academic",
      status: "available"
    },
    {
      icon: "🚌",
      title: "Bus Management",
      description: "Route management, student allotment, and real-time bus tracking system.",
      color: "#06b6d4",
      category: "Transport",
      status: "available"
    },
    {
      icon: "💰",
      title: "Fees & Tally",
      description: "Complete fee collection system with automatic Tally integration and multiple reports.",
      color: "#ec4899",
      category: "Finance",
      status: "available"
    },
    {
      icon: "📊",
      title: "Exam Management",
      description: "Exam scheduling, marks entry, automatic result generation, and report cards.",
      color: "#14b8a6",
      category: "Academic",
      status: "available"
    },
    {
      icon: "🔐",
      title: "Permission Control",
      description: "Department-wise granular permissions. Assign what each user can see and do.",
      color: "#6366f1",
      category: "Security",
      status: "available"
    },
    {
      icon: "📈",
      title: "Analytics Dashboard",
      description: "Real-time insights, charts, and reports for better decision making.",
      color: "#f97316",
      category: "Analytics",
      status: "available"
    },
    {
      icon: "👨‍🎓",
      title: "Student Management",
      description: "Complete student profile, attendance, marks, behavior tracking, and parent communication.",
      color: "#06b6d4",
      category: "Core",
      status: "available"
    },
    {
      icon: "👨‍🏫",
      title: "Teacher Management",
      description: "Teacher profiles, subject allocation, attendance, salary management, and performance tracking.",
      color: "#8b5cf6",
      category: "Core",
      status: "available"
    },
    {
      icon: "📱",
      title: "Mobile App (Teacher & Student)",
      description: "Dedicated mobile app for teachers and students. Access attendance, marks, timetable, assignments on the go.",
      color: "#ec4899",
      category: "Technology",
      status: "available"
    }
  ];

  // Coming Soon Features (2 features)
  const comingSoonFeatures = [
    {
      icon: "👤",
      title: "Face Recognition Attendance",
      description: "AI-powered face recognition system for automatic student attendance. Mark attendance in seconds with high accuracy.",
      color: "#8b5cf6",
      category: "AI Technology",
      status: "coming-soon",
      releaseDate: "Coming in Q1 2026",
      features: [
        "Real-time face detection",
        "Automatic attendance marking",
        "99.9% recognition accuracy",
        "Works in low light conditions",
        "Attendance reports with photos",
        "Parent notification on absence"
      ]
    },
    {
      icon: "🤖",
      title: "AI Chatbot System",
      description: "24/7 intelligent chatbot for instant student and parent queries. Get answers about fees, exams, timetable instantly.",
      color: "#06b6d4",
      category: "AI Technology",
      status: "coming-soon",
      releaseDate: "Coming in Q1 2026",
      features: [
        "24/7 instant responses",
        "Fee payment assistance",
        "Exam schedule queries",
        "Homework reminders",
        "Parent-teacher meeting scheduling",
        "Multi-language support"
      ]
    }
  ];

  // Total features = 13 + 2 = 15
  const allFeatures = [...currentFeatures, ...comingSoonFeatures];

  const roles = [
    {
      role: "Super Admin",
      access: "Full System Access",
      description: "Manage states, districts, schools, and all managers",
      icon: "👑"
    },
    {
      role: "State Manager",
      access: "State Level Access",
      description: "Manage all schools and districts within their state",
      icon: "📊"
    },
    {
      role: "District Manager",
      access: "District Level Access",
      description: "Manage all schools within their district",
      icon: "📍"
    },
    {
      role: "Principal",
      access: "School Level Access",
      description: "Complete control over their school - teachers, students, fees, exams",
      icon: "🏫"
    },
    {
      role: "Teacher",
      access: "Class Level Access",
      description: "Marks entry, attendance, timetable, assignments and student reports",
      icon: "👨‍🏫"
    },
    {
      role: "Accountant",
      access: "Finance Access",
      description: "Fee collection, expenses, reports, and Tally export",
      icon: "💰"
    }
  ];

  // AI Features (Already Available)
  const aiFeatures = [
    {
      icon: "🤖",
      title: "Smart Analytics",
      description: "AI-driven insights for better decision making. Analyze student performance trends.",
      color: "#8b5cf6"
    },
    {
      icon: "📊",
      title: "Predictive Reports",
      description: "Forecast student performance and attendance using machine learning algorithms.",
      color: "#f97316"
    },
    {
      icon: "💬",
      title: "Smart Recommendations",
      description: "Personalized learning recommendations based on student performance data.",
      color: "#10b981"
    },
    {
      icon: "🎯",
      title: "Performance Prediction",
      description: "Predict student outcomes and identify at-risk students early.",
      color: "#ec4899"
    }
  ];

  // Function to observe elements - defined with useCallback
  const observeElements = useCallback(() => {
    // Disconnect existing observer if any
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);
    
    // Observe all elements that should animate
    const animatedElements = document.querySelectorAll('.feature-card, .role-card, .benefit-card, .ai-card, .section-title, .about-content');
    animatedElements.forEach(el => observer.observe(el));
    
    observerRef.current = observer;
    return observer;
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % allFeatures.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [allFeatures.length]);

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    
    // Initial observation
    observeElements();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [observeElements]);

  // Re-observe when showAllFeatures changes (for View All button)
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      observeElements();
      
      // Force re-animation for new features
      const newFeatures = document.querySelectorAll('.feature-card');
      newFeatures.forEach(feature => {
        // Remove class first if already has it
        if (feature.classList.contains('animate-in')) {
          feature.classList.remove('animate-in');
        }
        // Trigger reflow
        void feature.offsetWidth;
        // Check if element is in viewport
        const rect = feature.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          feature.classList.add('animate-in');
        }
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [showAllFeatures, observeElements]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleViewAllFeatures = () => {
    setShowAllFeatures(true);
    setTimeout(() => {
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleShowLess = () => {
    setShowAllFeatures(false);
    // Force re-animation for fewer features
    setTimeout(() => {
      const features = document.querySelectorAll('.feature-card');
      features.forEach(feature => {
        feature.classList.remove('animate-in');
        void feature.offsetWidth;
        const rect = feature.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          feature.classList.add('animate-in');
        }
      });
    }, 100);
  };

  const handleComingSoonClick = (feature) => {
    setSelectedFeature(feature);
    setShowComingSoonModal(true);
  };

  const closeModal = () => {
    setShowComingSoonModal(false);
    setSelectedFeature(null);
  };

  const openPdfGuide = () => {
    setShowPdfModal(true);
  };

  const closePdfModal = () => {
    setShowPdfModal(false);
  };

  // Get initial features (first 6 available features)
  const initialFeatures = currentFeatures.slice(0, 6);
  const displayFeatures = showAllFeatures ? allFeatures : initialFeatures;

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="brand-icon-main">
              <img src="/images/logoDark.png" alt="School Logo" style={{ height: '40px' }} />
            </span>
            <span className="logo-text">Pupilify</span>
          </div>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#ai">AI Features</a>
            <a href="#roles">Roles</a>
            <a href="#about">About</a>
            <a href="#demo">Demo</a>
            <button onClick={openPdfGuide} className="pdf-guide-btn">
              📖 User Guide
            </button>
          </div>
          <button onClick={handleLoginClick} className="login-button">
            Login <span>→</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero video-hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title-main">
              <span className="highlight-text">Complete School</span>
              <span className="gradient-main"> Management System</span>
            </h1>
            <p className="hero-description">
              One platform to manage everything - from student admission to fees collection,
              exam results to TC generation. Perfect for schools, colleges, and educational institutes.
            </p>
            <div className="hero-buttons">
              <button onClick={handleLoginClick} className="btn-primary">
                Get Started
              </button>
              <a href="#demo" className="btn-secondary">
                Watch Demo →
              </a>
              <button onClick={openPdfGuide} className="btn-pdf">
                📄 Download User Guide
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card zoom-card">
              <div className="card-content">
                <div className="brand-logo-circle">
                  <img src="/images/logoDark.png" alt="Pupilify Logo" className="circle-logo" />
                </div>
                <h3>Smart Education</h3>
                <p>Digital Transformation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section id="demo" className="video-demo-section">
        <div className="container">
          <h2 className="section-title">Watch Pupilify in Action</h2>
          <p className="section-subtitle">See how our AI-powered system transforms school management</p>
          
          <div className="video-container">
            <div className="video-wrapper">
              <video controls className="demo-video">
                <source src="/videos/introduction.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            
            <div className="video-highlights">
              <div className="highlight-chip">✨ AI-Powered</div>
              <div className="highlight-chip">🚀 5x Faster</div>
              <div className="highlight-chip">💡 Smart Analytics</div>
              <div className="highlight-chip">🔒 Secure Platform</div>
              <div className="highlight-chip">📱 Mobile App Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Pupilify? Section */}
      <section className="about-section" id="about">
        <div className="container">
          <h2 className="section-title">What is Pupilify?</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                <strong>Pupilify</strong> is a complete, cloud-based school management system designed to 
                automate and streamline all educational institute operations. From managing multiple schools 
                across different states to handling daily attendance, our system provides a centralized 
                platform for administrators, teachers, students, and parents.
              </p>
              <div className="about-highlights">
                <div className="highlight-item">✅ 100% Paperless Operations</div>
                <div className="highlight-item">✅ Real-time Data Sync</div>
                <div className="highlight-item">✅ Secure & Scalable</div>
                <div className="highlight-item">✅ 24/7 Customer Support</div>
                <div className="highlight-item">✅ Mobile App for Teachers & Students</div>
                <div className="highlight-item">✅ AI-Powered Analytics</div>
              </div>
            </div>
            <div className="about-image">
              <div className="mission-vision">
                <div className="mission">
                  <h3>🎯 Mission</h3>
                  <p>Empower educational institutes with technology</p>
                </div>
                <div className="vision">
                  <h3>👁️ Vision</h3>
                  <p>Digital transformation in education for all</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section-main">
        <div className="container">
          <div className="features-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">Everything you need to manage your institution efficiently</p>
            {!showAllFeatures && (
              <div className="features-count-badge">
                <span className="available-badge">✓ {currentFeatures.length} Available Now</span>
                <span className="coming-badge">⌛ {comingSoonFeatures.length} Coming Soon</span>
              </div>
            )}
          </div>
          
          <div className="features-carousel">
            <div className="carousel-container">
              {allFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="feature-slide"
                  style={{ transform: `translateX(-${activeFeature * 100}%)` }}
                >
                  <div className={`feature-card-large ${feature.status === 'coming-soon' ? 'coming-soon-card' : ''}`}>
                    <div className="feature-icon-large" style={{ background: feature.color }}>
                      {feature.icon}
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    {feature.status === 'coming-soon' && (
                      <div className="coming-soon-badge">
                        <span>🚀 Coming Soon</span>
                      </div>
                    )}
                    <span className="feature-category">{feature.category}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="carousel-dots">
              {allFeatures.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === activeFeature ? 'active' : ''}`}
                  onClick={() => setActiveFeature(index)}
                />
              ))}
            </div>
          </div>

          <div className="features-grid">
            {displayFeatures.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-card ${feature.status === 'coming-soon' ? 'coming-soon-feature' : ''}`}
                onClick={() => feature.status === 'coming-soon' && handleComingSoonClick(feature)}
              >
                <div className="feature-icon-main" style={{ background: feature.color }}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                {feature.status === 'coming-soon' ? (
                  <div className="coming-soon-tag">
                    <span>🔜 Coming Soon</span>
                  </div>
                ) : (
                  <span className="feature-badge-main">{feature.category}</span>
                )}
                {feature.status === 'coming-soon' && (
                  <div className="notify-me-btn">
                    <button onClick={(e) => {
                      e.stopPropagation();
                      handleComingSoonClick(feature);
                    }}>
                      Learn More
                    </button>
                  </div>
                )}
                {feature.title === "Mobile App (Teacher & Student)" && (
                  <div className="mobile-app-badge">
                    <span>📱 Available on Play Store</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="view-more">
            {!showAllFeatures ? (
              <button onClick={handleViewAllFeatures} className="btn-outline">
                View All {allFeatures.length}+ Features →
              </button>
            ) : (
              <button onClick={handleShowLess} className="btn-outline">
                Show Less ↑
              </button>
            )}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="ai" className="ai-features-section">
        <div className="container">
          <h2 className="section-title">AI-Powered Features</h2>
          <p className="section-subtitle">Leverage the power of Artificial Intelligence</p>
          
          <div className="ai-grid">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="ai-card">
                <div className="ai-icon" style={{ background: feature.color + '20', color: feature.color }}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Face Recognition Preview Section */}
      <section className="face-recognition-section">
        <div className="container">
          <div className="face-recognition-content">
            <div className="face-recognition-text">
              <h2>👤 Face Recognition Attendance</h2>
              <p className="coming-soon-highlight">🚀 Coming Soon</p>
              <p>Revolutionize your attendance system with AI-powered face recognition technology. Mark attendance in seconds with 99.9% accuracy.</p>
              <div className="face-features">
                <div className="face-feature">
                  <span>✓</span>
                  <span>Real-time face detection</span>
                </div>
                <div className="face-feature">
                  <span>✓</span>
                  <span>Automatic attendance marking</span>
                </div>
                <div className="face-feature">
                  <span>✓</span>
                  <span>Works in low light conditions</span>
                </div>
                <div className="face-feature">
                  <span>✓</span>
                  <span>Parent notification on absence</span>
                </div>
              </div>
              <button className="notify-btn" onClick={() => {
                setSelectedFeature(comingSoonFeatures[0]);
                setShowComingSoonModal(true);
              }}>
                Get Notified When Launched
              </button>
            </div>
            <div className="face-recognition-image">
              <div className="face-demo">
                <div className="face-scan">
                  <div className="face-icon">👤</div>
                  <div className="scan-line"></div>
                  <div className="recognition-status">Scanning...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chatbot Preview Section */}
      <section className="chatbot-section">
        <div className="container">
          <div className="chatbot-content">
            <div className="chatbot-image">
              <div className="chat-demo">
                <div className="chat-message user">
                  <span>📱</span>
                  <p>What are the exam dates?</p>
                </div>
                <div className="chat-message bot">
                  <span>🤖</span>
                  <p>Exams start from March 15th. Check timetable for details!</p>
                </div>
                <div className="chat-message user">
                  <span>📱</span>
                  <p>How much is my fee balance?</p>
                </div>
                <div className="chat-message bot">
                  <span>🤖</span>
                  <p>Your fee balance is ₹5,000. Last date: Feb 28th</p>
                </div>
              </div>
            </div>
            <div className="chatbot-text">
              <h2>🤖 AI Chatbot System</h2>
              <p className="coming-soon-highlight">🚀 Coming Soon</p>
              <p>24/7 intelligent chatbot for instant student and parent queries. Get answers about fees, exams, timetable instantly.</p>
              <div className="chatbot-features">
                <div className="chatbot-feature">
                  <span>✓</span>
                  <span>24/7 instant responses</span>
                </div>
                <div className="chatbot-feature">
                  <span>✓</span>
                  <span>Fee payment assistance</span>
                </div>
                <div className="chatbot-feature">
                  <span>✓</span>
                  <span>Exam schedule queries</span>
                </div>
                <div className="chatbot-feature">
                  <span>✓</span>
                  <span>Multi-language support</span>
                </div>
              </div>
              <button className="notify-btn" onClick={() => {
                setSelectedFeature(comingSoonFeatures[1]);
                setShowComingSoonModal(true);
              }}>
                Get Notified When Launched
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="mobile-app-section">
        <div className="container">
          <div className="mobile-app-content">
            <div className="mobile-app-text">
              <h2>📱 Mobile App for Teachers & Students</h2>
              <p>Access your school management system on the go with our dedicated mobile application</p>
              <div className="mobile-features">
                <div className="mobile-feature">
                  <span>✓</span>
                  <span>View Timetable & Attendance</span>
                </div>
                <div className="mobile-feature">
                  <span>✓</span>
                  <span>Check Exam Results & Marks</span>
                </div>
                <div className="mobile-feature">
                  <span>✓</span>
                  <span>Submit Assignments Online</span>
                </div>
                <div className="mobile-feature">
                  <span>✓</span>
                  <span>Receive Important Notifications</span>
                </div>
                <div className="mobile-feature">
                  <span>✓</span>
                  <span>Access Study Materials</span>
                </div>
                <div className="mobile-feature">
                  <span>✓</span>
                  <span>Assignment Submission & Tracking</span>
                </div>
              </div>
              <div className="store-buttons">
                <button className="play-store-btn">
                  <span>📱</span> Google Play
                </button>
                <button className="app-store-btn">
                  <span>🍎</span> App Store
                </button>
              </div>
            </div>
            <div className="mobile-app-image">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="app-interface">
                    <div className="app-header">Pupilify</div>
                    <div className="app-content">
                      <div className="app-feature">📅 Today's Timetable</div>
                      <div className="app-feature">📊 Attendance: 85%</div>
                      <div className="app-feature">📝 Pending Assignments: 2</div>
                      <div className="app-feature">✅ Assignment Submitted</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles & Hierarchy Section */}
      <section id="roles" className="roles-section">
        <div className="container">
          <h2 className="section-title">Role-Based Hierarchy</h2>
          <p className="section-subtitle">Complete control with perfect role management</p>
          
          <div className="roles-grid">
            {roles.map((role, index) => (
              <div key={index} className="role-card">
                <div className="role-icon">{role.icon}</div>
                <h4>{role.role}</h4>
                <div className="role-access">{role.access}</div>
                <p>{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <h2 className="section-title">Why Choose Pupilify?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🚀</div>
              <h3>Easy to Use</h3>
              <p>Intuitive interface designed for non-technical users</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔒</div>
              <h3>Secure & Reliable</h3>
              <p>Bank-level security with regular backups</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💯</div>
              <h3>99.9% Uptime</h3>
              <p>Cloud-based system with guaranteed availability</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">📱</div>
              <h3>Mobile Ready</h3>
              <p>Dedicated mobile app for teachers & students</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔄</div>
              <h3>Regular Updates</h3>
              <p>Continuous improvements and new features</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🎯</div>
              <h3>Dedicated Support</h3>
              <p>24/7 customer support and training</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Transform Your School Management?</h2>
          <button onClick={handleLoginClick} className="cta-button">
            Login to Dashboard →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col">
              <h4>Pupilify</h4>
              <p>Complete School Management System</p>
              <p className="mobile-app-footer">📱 Mobile App Available</p>
              <p className="ai-footer">🤖 AI-Powered Platform</p>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <button onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })} className="footer-link-btn">Home</button>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="footer-link-btn">Features</button>
              <button onClick={() => document.getElementById('ai')?.scrollIntoView({ behavior: 'smooth' })} className="footer-link-btn">AI Features</button>
              <button onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })} className="footer-link-btn">Roles</button>
              <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="footer-link-btn">About</button>
              <button onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })} className="footer-link-btn">Demo</button>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <p>📧 khatushatechworks@gmail.com</p>
              <p>📞 +91 6266755995</p>
              <p>📞 +91 73545 96475</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Pupilify. All rights reserved. | AI-Powered School Management System</p>
            <div className="footer-links">
              <Link to="/privacy-policy" className="terms-footer-link">
                🔒 Privacy Policy
              </Link>
              <Link to="/termsandconditions" className="terms-footer-link">
                📋 Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* PDF User Guide Modal */}
      {showPdfModal && (
        <div className="modal-overlay" onClick={closePdfModal}>
          <div className="pdf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header pdf-modal-header">
              <div className="modal-icon">📖</div>
              <h3>User Guide</h3>
              <button className="modal-close" onClick={closePdfModal}>×</button>
            </div>
            <div className="modal-body pdf-modal-body">
              <div className="pdf-options">
                <div className="pdf-option-card" onClick={() => window.open('/pdfs/guide.pdf', '_blank')}>
                  <div className="pdf-icon">📄</div>
                  <h4>Complete User Guide</h4>
                  <p>Detailed documentation with step-by-step instructions</p>
                  <button className="pdf-download-btn">Download PDF</button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closePdfModal} className="close-modal-btn">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Modal */}
      {showComingSoonModal && selectedFeature && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="coming-soon-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: selectedFeature.color }}>
              <div className="modal-icon">{selectedFeature.icon}</div>
              <h3>{selectedFeature.title}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="release-badge">
                <span>🚀 {selectedFeature.releaseDate}</span>
              </div>
              <p className="feature-description">{selectedFeature.description}</p>
              
              <div className="feature-list">
                <h4>What's coming:</h4>
                <ul>
                  {selectedFeature.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="check-icon">✨</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="notify-section">
                <p>Want to be notified when this feature launches?</p>
                <div className="notify-form">
                  <input type="email" placeholder="Enter your email" />
                  <button>Notify Me</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewPage;