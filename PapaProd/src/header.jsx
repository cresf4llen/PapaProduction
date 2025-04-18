import { useState, useEffect } from 'react';
import './index.css';

function Header({ isAtCarousel }) {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const isVisible = prevScrollPos > currentScrollPos || currentScrollPos < 10;
      
      setPrevScrollPos(currentScrollPos);
      setVisible(isVisible);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  return (
    <header 
      className={`header ${visible ? 'visible' : 'hidden'}`} 
      style={{ 
        backgroundColor: isAtCarousel ? 'transparent' : '#000000', 
        transition: 'background-color 0.6s ease, transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)'
      }}
    >
      <div className="container">
        <div className="logo">
          <h1>PAPA PRODUCTION</h1>
        </div>
        
        <div className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <nav className={`nav ${isOpen ? 'active' : ''}`}>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#work">Work</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;