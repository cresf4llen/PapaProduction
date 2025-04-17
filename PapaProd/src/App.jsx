import { useState, useEffect, useRef } from 'react';
import Header from './header';
import './index.css';
// Import video assets
import video1 from './assets/Snapins.ai_video_AQPjIbxKRDZyaeh6UASDapjMdf9hZCLt-4hs6HJcnVPfJCs8Ed3kSjyRFLL5s_TCVAqKzT9do4nPhdrUp1gXKP76wE7dVnGHQaUgIp8.mp4';
import video2 from './assets/Snapins.ai_video_AQMJvKybUHwwICnQLLKCWB05er-KJ0t8Y6vqkR3KEVlk-O3r16Lxsf4jz7do2OUFGN5K8gHAD93R0m5BLRA25JLzb97lgvLQJ3j9LSI.mp4';
import video3 from './assets/Snapins.ai_video_AQNAf-X0R5VhRT8vI3Zf456xdrcxmRQzzhcQ4beWK4GTVYpe72U3OAVgme0IFANLVdtaoS16c70hfZ3NvQBDYK7hQCDEIbWNVvHxCOo.mp4';

function App() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const realSlidesCount = 3;
  const initialSlideIndex = 1; // Start at the first *real* slide (index 1 in extended array)
  const [currentVisualIndex, setCurrentVisualIndex] = useState(initialSlideIndex);
  const [isTransitioning, setIsTransitioning] = useState(false); // Tracks if CSS transition is active
  const [isLoopingJump, setIsLoopingJump] = useState(false); // Tracks if we are doing the silent jump

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
              setIsLoopingJump(false)
          }, 50); // Short delay to allow browser to render the jump
          return () => clearTimeout(timer)
      }
  }, [isLoopingJump])

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

  if (loading) {
    return (
      <div className={`loader ${fadeOut ? 'fade-out' : ''}`}>
        <h1>PAPA PRODUCTION</h1>
        <div className="loading-bar"></div>
      </div>
    );
  }
  
  // Calculate the logical slide index for the active title
  let activeTitleIndex = (currentVisualIndex - 1 + realSlidesCount) % realSlidesCount;
  if (isLoopingJump) { // Keep title hidden during the jump
      activeTitleIndex = -1; // Or some value that won't match any index
  }

  return (
    <div className="app fade-in">
      <Header />
      
      {/* Hero Section - Carousel */}
      <section id="home" className="hero">
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
                    src={item.videoSrc}
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="video-element"
                  ></video>
                </div>
                <div className="overlay"></div>
                {/* Apply active-title class based on calculated logical index */}
                <div className={`carousel-title ${index - 1 === activeTitleIndex ? 'active-title' : ''}`}>
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
        <h2>Our Work</h2>
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
            {/* <img src="/about-image.jpg" alt="Behind the scenes at Papa Production" /> */}
          </div>
        </div>
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
