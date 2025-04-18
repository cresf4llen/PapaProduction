import { useState, useEffect, useRef } from 'react';
import Header from './header';
import './index.css';
// Import video assets
import video1 from './assets/Snapins.ai_video_AQPjIbxKRDZyaeh6UASDapjMdf9hZCLt-4hs6HJcnVPfJCs8Ed3kSjyRFLL5s_TCVAqKzT9do4nPhdrUp1gXKP76wE7dVnGHQaUgIp8.mp4';
import video2 from './assets/Snapins.ai_video_AQMJvKybUHwwICnQLLKCWB05er-KJ0t8Y6vqkR3KEVlk-O3r16Lxsf4jz7do2OUFGN5K8gHAD93R0m5BLRA25JLzb97lgvLQJ3j9LSI.mp4';
import video3 from './assets/Snapins.ai_video_AQNAf-X0R5VhRT8vI3Zf456xdrcxmRQzzhcQ4beWK4GTVYpe72U3OAVgme0IFANLVdtaoS16c70hfZ3NvQBDYK7hQCDEIbWNVvHxCOo.mp4';
// Import photo assets
import photo1 from './assets/486827349_1002798388234163_4059944686867970730_n.jpg';
import photo2 from './assets/491274945_676067771833559_7066320896018580383_n.jpg';
import photo3 from './assets/490496008_1003695761896568_8322410131066097011_n.jpg';
import photo4 from './assets/484226484_9397591200362708_8792654812032031085_n.jpg';
import photo5 from './assets/490992256_675718622079740_9167887760017629774_n.jpg';
import photo6 from './assets/490980769_1450302986380255_7120733704553065967_n.jpg';

function App() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showSoundPopup, setShowSoundPopup] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const videoRefs = useRef([]);
  const [videosLoaded, setVideosLoaded] = useState(0);
  const titleRefs = useRef([]);
  const carouselSectionRef = useRef(null);
  const [isCarouselVisible, setIsCarouselVisible] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [isSoundPopupMounted, setIsSoundPopupMounted] = useState(false); // Mount/unmount control
  const [isSoundPopupVisible, setIsSoundPopupVisible] = useState(false); // Visibility control for animation
  
  const realSlidesCount = 3;
  const initialSlideIndex = 1; // Start at the first *real* slide (index 1 in extended array)
  const [currentVisualIndex, setCurrentVisualIndex] = useState(initialSlideIndex);
  const [isTransitioning, setIsTransitioning] = useState(false); // Tracks if CSS transition is active
  const [isLoopingJump, setIsLoopingJump] = useState(false); // Tracks if we are doing the silent jump
  const [titleVisible, setTitleVisible] = useState(true);

  const carouselInnerRef = useRef(null); // Ref for the inner container

  // Original items
  const originalCarouselItems = [
    { id: 1, videoSrc: video1, title: "Premium Commercial Production" },
    { id: 2, videoSrc: video2, title: "Cinematic Storytelling" },
    { id: 3, videoSrc: video3, title: "Portfolio Showcase" }
  ];

  // Create extended list with clones
  const extendedCarouselItems = [
    { ...originalCarouselItems[realSlidesCount - 1], id: `clone-last-${originalCarouselItems[realSlidesCount - 1].id}` }, // Last clone
    ...originalCarouselItems,
    { ...originalCarouselItems[0], id: `clone-first-${originalCarouselItems[0].id}` } // First clone
  ];

  const transitionDuration = 800; // Match CSS transition duration

  // Handle video load events
  const handleVideoLoad = () => {
    setVideosLoaded(prev => prev + 1);
  };

  // Pause all videos
  const pauseAllVideos = () => {
    videoRefs.current.forEach(videoRef => {
      if (videoRef && !videoRef.paused) {
        videoRef.pause();
      }
    });
  };

  // Check if videos should play based on visibility conditions
  const shouldPlayVideos = () => {
    return isCarouselVisible && isPageVisible;
  };

  // Update video playback and audio
  const updateVideos = () => {
    // If carousel is not visible or page is not visible, pause all videos
    if (!shouldPlayVideos()) {
      pauseAllVideos();
      return;
    }

    videoRefs.current.forEach((videoRef, index) => {
      if (videoRef) {
        if (index === currentVisualIndex) {
          // Current video: play and handle audio based on sound preference
          videoRef.muted = !isSoundEnabled;
          videoRef.play().catch(e => console.error("Video play failed:", e));
        } else {
          // Non-visible videos: pause and mute
          videoRef.muted = true;
          videoRef.pause();
        }
      }
    });
  };

  // Handle enabling sound
  const enableSound = () => {
    setIsSoundEnabled(true);
    setShowSoundPopup(false);
    
    // Update the active video to unmute it
    updateVideos();
  };

  // Skip sound
  const skipSound = () => {
    setShowSoundPopup(false);
  };

  // Initialize videos
  const initializeVideos = () => {
    // Only initialize if carousel is visible and page is visible
    if (!shouldPlayVideos()) return;
    
    videoRefs.current.forEach((videoRef, index) => {
      if (videoRef) {
        // Only load and play the current video
        if (index === currentVisualIndex) {
          videoRef.muted = !isSoundEnabled;
          videoRef.play().catch(e => console.error("Video play failed:", e));
        } else {
          videoRef.muted = true;
          videoRef.pause();
          
          // Load metadata but don't play
          if (videoRef.readyState === 0) {
            videoRef.load();
          }
        }
      }
    });
  };

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    // Listen for visibility change events
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Update videos when page visibility changes
  useEffect(() => {
    updateVideos();
  }, [isPageVisible]);

  // Set up intersection observer to detect when carousel is visible
  useEffect(() => {
    if (!carouselSectionRef.current) return;

    const options = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.1 // 10% visibility is enough to trigger
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Update visibility state
        setIsCarouselVisible(entry.isIntersecting);
      });
    }, options);

    observer.observe(carouselSectionRef.current);

    return () => {
      if (carouselSectionRef.current) {
        observer.unobserve(carouselSectionRef.current);
      }
    };
  }, [carouselSectionRef.current]);

  // Update videos when carousel visibility changes
  useEffect(() => {
    updateVideos();
  }, [isCarouselVisible]);

  // Update title visibility and transitions
  const updateTitles = () => {
    // Calculate the logical slide index for the active title
    const activeTitleIndex = (currentVisualIndex - 1 + realSlidesCount) % realSlidesCount;
    
    titleRefs.current.forEach((titleRef, index) => {
      if (titleRef) {
        const isActive = index === currentVisualIndex;
        if (isActive) {
          titleRef.classList.add('active-title');
        } else {
          titleRef.classList.remove('active-title');
        }
      }
    });
  };

  useEffect(() => {
    // Initialize videos after they're rendered
    if (videoRefs.current.length > 0) {
      initializeVideos();
    }
  }, [videoRefs.current.length]);

  // Handle title transitions before slide changes
  useEffect(() => {
    if (isTransitioning) {
      // Hide title during transitions for smoother experience
      setTitleVisible(false);
      
      // Show title again after transition is complete
      const timer = setTimeout(() => {
        setTitleVisible(true);
      }, transitionDuration * 0.7); // Slightly before transition ends
      
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  useEffect(() => {
    // Update videos and titles when slides change
    // Don't update during looping jumps as this would be invisible
    if (!isLoopingJump) {
      updateVideos();
      
      if (!isTransitioning) {
        updateTitles();
      }
    }
  }, [currentVisualIndex, isTransitioning, isSoundEnabled, isLoopingJump]);

  useEffect(() => {
    // Reset transition state after the CSS transition completes
    if (!isTransitioning && !isLoopingJump) return;

    const timer = setTimeout(() => {
      setIsTransitioning(false);
      
      // Handle the silent jump after reaching a clone
      if (currentVisualIndex === 0) { // Reached last clone (at index 0)
        setIsLoopingJump(true);
        setCurrentVisualIndex(realSlidesCount); // Jump to real last slide
      } else if (currentVisualIndex === extendedCarouselItems.length - 1) { // Reached first clone
        setIsLoopingJump(true);
        setCurrentVisualIndex(initialSlideIndex); // Jump to real first slide
      }
    }, transitionDuration);

    return () => clearTimeout(timer);
  }, [isTransitioning, currentVisualIndex, isLoopingJump]);
  
  useEffect(() => {
    // Remove the no-transition class shortly after a jump to re-enable transitions
    if (isLoopingJump) {
      const timer = setTimeout(() => {
        setIsLoopingJump(false);
        // Ensure titles and videos are properly updated after loop jumps
        updateTitles();
        updateVideos();
      }, 50); // Short delay to allow browser to render the jump
      return () => clearTimeout(timer);
    }
  }, [isLoopingJump]);

  // Handle carousel navigation
  const navigateSlide = (direction) => {
    if (isTransitioning || isLoopingJump) return; // Prevent navigation during transition/jump
    setIsTransitioning(true);
    setCurrentVisualIndex(prev => prev + direction);
  };

  const nextSlide = () => navigateSlide(1);
  const prevSlide = () => navigateSlide(-1);
  
  useEffect(() => {
    // Simulate loading with a smooth transition
    setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000); // Wait for fade out animation to complete
    }, 2000);

    // Handle scroll to top button visibility
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Effect to handle popup animation
  useEffect(() => {
    const transitionTime = 500; // Match CSS transition duration
    const visibilityDelay = 50; // Use a small delay for transition triggering
    let visibleTimer, unmountTimer;

    // Run immediately if showSoundPopup is true
    if (showSoundPopup) {
      setIsSoundPopupMounted(true); // Mount immediately
      // Trigger fade-in animation shortly after mounting
      visibleTimer = setTimeout(() => {
        setIsSoundPopupVisible(true);
      }, visibilityDelay); 
    } else {
      // If popup should be hidden initially or dismissed later
      setIsSoundPopupVisible(false); 
      // Unmount after the fade-out animation completes
      unmountTimer = setTimeout(() => {
        setIsSoundPopupMounted(false);
      }, transitionTime);
    }

    // Cleanup timers on unmount or if showSoundPopup changes
    return () => {
      clearTimeout(visibleTimer);
      clearTimeout(unmountTimer);
    };
    // Only depend on showSoundPopup now
  }, [showSoundPopup]);

  if (loading) {
    return (
      <div className={`loader ${fadeOut ? 'fade-out' : ''}`}>
        <h1>PAPA PRODUCTION</h1>
        <div className="loading-bar"></div>
      </div>
    );
  }

  return (
    <div className="app fade-in">
      <Header isAtCarousel={isCarouselVisible} />
      
      {/* Sound Permission Popup */}
      {isSoundPopupMounted && (
        <div className={`sound-popup ${isSoundPopupVisible ? 'visible' : ''}`}>
          <div className="sound-popup-content">
            <p>Enable sound for a better experience?</p>
            <div className="sound-popup-buttons">
              <button onClick={enableSound} className="btn sound-btn">Yes</button>
              <button onClick={skipSound} className="btn btn-secondary sound-btn">No</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section - Carousel */}
      <section id="home" className="hero" ref={carouselSectionRef}>
        <div className="carousel-container">
          <div 
            ref={carouselInnerRef}
            className={`carousel-inner ${isLoopingJump ? 'no-transition' : ''}`}
            style={{ transform: `translateX(-${currentVisualIndex * 100}%)` }}
          >
            {extendedCarouselItems.map((item, index) => (
              <div 
                key={item.id} 
                className="carousel-item"
              >
                <div className="video-container">
                  <video
                    ref={el => { videoRefs.current[index] = el }}
                    src={item.videoSrc}
                    muted={!isSoundEnabled || index !== currentVisualIndex}
                    autoPlay={index === currentVisualIndex && shouldPlayVideos()}
                    loop
                    playsInline
                    preload="auto"
                    onLoadedData={handleVideoLoad}
                    className="video-element"
                  ></video>
                </div>
                <div className="overlay"></div>
                {/* Improved title handling */}
                <div 
                  ref={el => { titleRefs.current[index] = el }}
                  className={`carousel-title ${index === currentVisualIndex && titleVisible ? 'active-title' : ''}`}
                >
                  <h2>{item.title}</h2>
                </div>
              </div>
            ))}
          </div>
          
          <button className="carousel-nav prev" onClick={prevSlide} disabled={isTransitioning || isLoopingJump}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="carousel-nav next" onClick={nextSlide} disabled={isTransitioning || isLoopingJump}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </section>
      




















      {/* Work/Portfolio Section - Instagram Reels */}
      <section id="work" className="work">






      <div className="photo-gallery">
          <h2>Behind the Scenes</h2>
          <div className="gallery-wrapper">
            <div className="gallery-grid">
              <div className="gallery-item featured">
                <div className="image-container">
                  <img src={photo2} alt="Production scene 1" />
                  <div className="image-overlay">
                    <div className="image-caption">
                      <h3>On Location Shoot</h3>
                      <p>Capturing the perfect moment in natural lighting</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="gallery-item">
                <div className="image-container">
                  <img src={photo3} alt="Production scene 2" />
                  <div className="image-overlay">
                    <div className="image-caption">
                      <h3>Camera Setup</h3>
                      <p>Professional equipment for premium quality</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="gallery-item vertical">
                <div className="image-container">
                  <img src={photo4} alt="Production scene 3" />
                  <div className="image-overlay">
                    <div className="image-caption">
                      <h3>Director's View</h3>
                      <p>Creating the perfect composition</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="gallery-item">
                <div className="image-container">
                  <img src={photo5} alt="Production scene 4" />
                  <div className="image-overlay">
                    <div className="image-caption">
                      <h3>Lighting Setup</h3>
                      <p>Crafting the perfect ambiance</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="gallery-item wide">
                <div className="image-container">
                  <img src={photo6} alt="Production scene 5" />
                  <div className="image-overlay">
                    <div className="image-caption">
                      <h3>Production Team</h3>
                      <p>Collaboration brings vision to life</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="gallery-decorative-element left"></div>
            <div className="gallery-decorative-element right"></div>
          </div>
        </div>











        <h2>Our Work</h2>
        
        {/* Featured Project */}
        {/* <div className="featured-project">
          <div className="featured-image">
            <img src={photo4} alt="Featured Project" />
          </div>
          <div className="featured-content">
            <h3>Featured Project</h3>
            <p>We take pride in delivering exceptional visual content for our clients. Our team combines technical expertise with creative vision to bring your ideas to life.</p>
          </div>
        </div> */}
        
        <div className="instagram-grid">
          {/* Instagram Post 1 */}
          <div className="instagram-post">
            <iframe
              src="https://www.instagram.com/p/DIfC1n0MFZF/embed"
              width="100%"
              height="450"
              frameBorder="0"
              scrolling="no"
              allowTransparency="true"
            ></iframe>
          </div>

          {/* Instagram Post 2 */}
          <div className="instagram-post">
            <iframe
              src="https://www.instagram.com/p/DHtxSLOMSC4/embed"
              width="100%"
              height="450"
              frameBorder="0"
              scrolling="no"
              allowTransparency="true"
            ></iframe>
          </div>

          {/* Instagram Post 3 */}
          <div className="instagram-post">
            <iframe
              src="https://www.instagram.com/p/DG803kUsF4l/embed"
              width="100%"
              height="450"
              frameBorder="0"
              scrolling="no"
              allowTransparency="true"
            ></iframe>
          </div>
        </div>

        {/* Instagram Embed Script - Required for the iframe embeds to work */}
        <script async src="https://www.instagram.com/embed.js"></script>

        <style jsx="true">{`
          .instagram-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto 2rem auto;
          }
          .instagram-post {
            width: 100%;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            background-color: #fff;
            min-height: 450px;
            transition: transform 0.3s ease;
          }
          .instagram-post:hover {
            transform: translateY(-5px);
          }
          @media (max-width: 768px) {
            .instagram-grid {
              grid-template-columns: 1fr;
            }
          }
          
          /* Sound popup styles */
          .sound-popup {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translate(-50%, 20px); /* Start slightly lower */
            z-index: 1000;
            width: auto;
            max-width: 90%;
            opacity: 0;
            transition: opacity 0.5s ease, transform 0.5s ease;
            pointer-events: none;
          }

          .sound-popup.visible {
            opacity: 1;
            transform: translate(-50%, 0);
            pointer-events: auto;
          }
          
          .sound-popup-content {
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            gap: 15px;
          }
          
          .sound-popup-content p {
            margin: 0;
            font-size: 0.9rem;
          }
          
          .sound-popup-buttons {
            display: flex;
            gap: 10px;
          }
          
          .sound-btn {
            padding: 8px 12px;
            font-size: 0.85rem;
            border-radius: 4px;
            cursor: pointer;
          }
          
          .btn-secondary {
            background-color: #6c757d;
          }
          
          .btn-secondary:hover {
            background-color: #5a6268;
          }
          
          @media (max-width: 600px) {
            .sound-popup-content {
              flex-direction: column;
              padding: 12px 15px;
            }
          }
          
          /* Improved title transitions */
          .carousel-title {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
            visibility: hidden;
            position: absolute;
            bottom: 100px;
            left: 0;
            width: 100%;
            text-align: center;
            z-index: 5;
          }
          
          .carousel-title.active-title {
            opacity: 1;
            transform: translateY(0);
            visibility: visible;
          }
          
          .carousel-title h2 {
            color: white;
            font-size: 2.5rem;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            margin: 0;
            padding: 0 20px;
          }
          
          @media (max-width: 768px) {
            .carousel-title h2 {
              font-size: 1.8rem;
            }
          }
        `}</style>
      </section>
      
      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <h2>About Us</h2>
            <h1>PAPA PRODUCTION</h1>
            <h3>Film & Commercial Videography</h3>
            <p>
              Bringing your vision to life through exceptional cinematography
            </p>
            <p>
              Papa Production is a film and commercial videography company dedicated to creating 
              visually stunning content that tells your story. With years of experience in the industry,
              our team combines technical expertise with creative vision to deliver exceptional results.
            </p>
            <p>
              Whether you're looking for a commercial advertisement, brand video, documentary, or
              feature film, we approach each project with the same level of passion and commitment.
            </p>
          </div>
          <div className="about-image">
            <img src={photo1} alt="Papa Production behind the scenes" />
          </div>
        </div>

        {/* Photo Gallery - Behind the Scenes */}
        {/* <div className="photo-gallery">
          <h2>Behind the Scenes</h2>
          <div className="gallery-wrapper">
            <div className="gallery-grid">
              <div className="gallery-item featured">
                <div className="image-container">
                  <img src={photo2} alt="Production scene 1" />
                  <div className="image-overlay">
                    <div className="image-caption">
                      <h3>On Location Shoot</h3>
                      <p>Capturing the perfect moment in natural lighting</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="gallery-item">
                <div className="image-container">
                  <img src={photo3} alt="Production scene 2" />
                  <div className="image-overlay">
                    <div className="image-caption">
                      <h3>Camera Setup</h3>
                      <p>Professional equipment for premium quality</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="gallery-item vertical">
                <div className="image-container">
                  <img src={photo4} alt="Production scene 3" />
                  <div className="image-overlay">
                    <div className="image-caption">
                      <h3>Director's View</h3>
                      <p>Creating the perfect composition</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="gallery-item">
                <div className="image-container">
                  <img src={photo5} alt="Production scene 4" />
                  <div className="image-overlay">
                    <div className="image-caption">
                      <h3>Lighting Setup</h3>
                      <p>Crafting the perfect ambiance</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="gallery-item wide">
                <div className="image-container">
                  <img src={photo6} alt="Production scene 5" />
                  <div className="image-overlay">
                    <div className="image-caption">
                      <h3>Production Team</h3>
                      <p>Collaboration brings vision to life</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="gallery-decorative-element left"></div>
            <div className="gallery-decorative-element right"></div>
          </div>
        </div> */}
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2>Get In Touch</h2>
          <div className="contact-grid">
            <div className="contact-info">
              <h3>Contact Information</h3>
              <p>Ready to bring your vision to life? Reach out to us today.</p>
              <ul>
                {/* <li>
                  <i className="fas fa-envelope"></i>
                  <a href="mailto:info@papaproduction.com">info@papaproduction.com</a>
                </li>
                <li>
                  <i className="fas fa-phone"></i>
                  <a href="tel:+1234567890">+1 (234) 567-890</a>
                </li>
                <li>
                  <i className="fas fa-map-marker-alt"></i>
                  <address>Your Studio Location</address>
                </li> */}
              </ul>
              <div className="social-links">
                <a href="https://www.instagram.com/_papaproduction/" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-instagram"></i>
                </a>
                {/* <a href="#" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-youtube"></i>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-vimeo-v"></i>
                </a> */}
              </div>
            </div>
            <div className="contact-form">
              <form>
                <div className="form-group">
                  <input type="text" id="name" name="name" placeholder="Your Name" required />
                </div>
                <div className="form-group">
                  <input type="email" id="email" name="email" placeholder="Your Email" required />
                </div>
                <div className="form-group">
                  <input type="text" id="subject" name="subject" placeholder="Subject" />
                </div>
                <div className="form-group">
                  <textarea id="message" name="message" placeholder="Your Message" required></textarea>
                </div>
                <button type="submit" className="btn">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <h3>PAPA PRODUCTION</h3>
            </div>
            <div className="footer-links">
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#work">Work</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Papa Production. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button className="scroll-top" onClick={scrollToTop}>
          <i className="fas fa-arrow-up"></i>
        </button>
      )}
    </div>
  );
}

export default App;
