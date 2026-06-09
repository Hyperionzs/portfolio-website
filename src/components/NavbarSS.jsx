import React, { useState, useEffect, useRef } from 'react';
import { Home, User, Code2, Contact, Menu, X, CodeSquare, Upload, Bell, ChevronDown, LogOut, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const navItems = [
  { icon: <Home size={18} />, label: 'Home', href: '#hero' },
  { icon: <User size={18} />, label: 'About Me', href: '#about' },
  { icon: <CodeSquare size={18} />, label: 'Tech Stack', href: '#tech' },
  { icon: <Code2 size={18} />, label: 'Projects', href: '#projects' },
  { icon: <Contact size={18} />, label: 'Contact', href: '#contact' },
];

export function Navbar({ isLoggedIn, role, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Example notification count
  const audioRef = useRef(new Audio()); // Initialize without src
  const progressBarRef = useRef(null);

  // Handle scroll effect and progress
  useEffect(() => {
    let animationFrameId;

    const updateProgress = () => {
      const winScroll = window.pageYOffset || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      
      setScrollProgress(scrolled);
      setScrolled(winScroll > 50);

      // Update active section
      const sections = ['hero', 'about', 'tech', 'projects', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }

      animationFrameId = requestAnimationFrame(updateProgress);
    };

    updateProgress();
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Add hash change listener to ensure proper scrolling
  useEffect(() => {
    const handleHashChange = () => {
      // Check if we have a hash in the URL
      if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const element = document.getElementById(targetId);
        
        if (element) {
          // Wait a bit to ensure the page is ready
          setTimeout(() => {
            // Get header height
            const headerHeight = document.querySelector('header').offsetHeight;
            
            // Get the absolute top position of the element relative to the document
            const elementOffset = element.getBoundingClientRect().top + window.pageYOffset;
            
            // Scroll to exactly the start position of the element minus the header height
            window.scrollTo({
              top: elementOffset - headerHeight,
              behavior: 'smooth'
            });
          }, 100);
        }
      }
    };

    // Add event listener for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Also handle initial load if there's a hash in the URL
    if (window.location.hash) {
      handleHashChange();
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Play hover sound with error handling
  const playHoverSound = () => {
    if (!audioRef.current.src) {
      try {
        audioRef.current.src = '/portfolio-website/sounds/hover-sound.mp3';
      } catch (error) {
        console.warn('Hover sound not available');
        return;
      }
    }
    audioRef.current.volume = 0.1;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {}); // Ignore autoplay restrictions or missing file
  };

  // Quick actions menu items
  const quickActions = [
    { icon: <Download size={16} />, label: 'Download CV', action: () => window.open('/cv.pdf', '_blank') },
    { icon: <Share2 size={16} />, label: 'Share Profile', action: () => navigator.share?.({ 
      title: 'Anggra.Dev Portfolio',
      url: window.location.href 
    }) },
    ...(isLoggedIn ? [{ icon: <LogOut size={16} />, label: 'Logout', action: onLogout }] : []),
  ];

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Scroll Progress Bar */}
      <div 
        ref={progressBarRef}
        className="fixed top-0 left-0 w-full h-1 bg-gray-800/50 z-[999]"
      >
        <div 
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 background-animate"
          style={{
            width: `${scrollProgress}%`,
            willChange: 'width',
            transition: 'width 50ms linear'
          }}
        />
      </div>

      <header className={`fixed top-0 left-0 w-full z-[99] transition-all duration-300 ${
        scrolled ? 'backdrop-blur bg-black/50 shadow-lg' : 'backdrop-blur-sm bg-black/30'
      } border-b border-white/10`}>
        <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between text-white">
          {/* Logo with enhanced animation */}
          <motion.a
            href="#hero"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ 
              duration: 0.8,
              scale: { type: "spring", stiffness: 400, damping: 10 }
            }}
            className="text-xl font-bold tracking-wide bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 bg-clip-text text-transparent cursor-pointer relative group"
            onMouseEnter={playHoverSound}
          >
            Anggra.Dev
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 transition-all group-hover:w-full"></span>
          </motion.a>

          {/* Desktop Menu */}
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12 } },
            }}
            className="hidden md:flex space-x-6 text-sm md:text-base font-medium"
          >
            {navItems.map((item, index) => (
              <motion.li
                key={index}
                variants={{
                  hidden: { opacity: 0, y: -20, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.175, 0.885, 0.32, 1.275],
                }}
              >
                <NavItem 
                  icon={item.icon} 
                  label={item.label} 
                  href={item.href} 
                  isActive={`#${activeSection}` === item.href}
                  onHover={playHoverSound}
                />
              </motion.li>
            ))}

            {isLoggedIn && role === 'Admin' && (
              <motion.li
                variants={{
                  hidden: { opacity: 0, y: -20, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.175, 0.885, 0.32, 1.275],
                }}
              >
                <Link
                  to="/UploadProject"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full transition-all hover:bg-purple-600/20 hover:backdrop-blur-md hover:shadow-md hover:text-purple-300"
                  onMouseEnter={playHoverSound}
                >
                  <Upload size={18} />
                  Upload Project
                </Link>
              </motion.li>
            )}
          </motion.ul>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Notifications for Admin */}
            {isLoggedIn && role === 'Admin' && (
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <button 
                  className="p-2 rounded-full hover:bg-purple-600/20 transition-colors relative"
                  onMouseEnter={playHoverSound}
                >
                  <Bell size={18} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </motion.div>
            )}

            {/* Quick Actions Dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-purple-600/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={playHoverSound}
              >
                <span>More Actions</span>
                <ChevronDown size={16} className={`transform transition-transform ${quickActionsOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {quickActionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 py-2 bg-gray-900/90 backdrop-blur-lg rounded-xl shadow-xl border border-white/10"
                  >
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={index}
                        onClick={() => {
                          action.action();
                          setQuickActionsOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white hover:bg-purple-600/20 transition-colors"
                        whileHover={{ x: 5 }}
                        onMouseEnter={playHoverSound}
                      >
                        {action.icon}
                        {action.label}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Only show logout button if logged in */}
            {isLoggedIn && (
              <motion.button
                onClick={onLogout}
                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={playHoverSound}
              >
                Logout
              </motion.button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {isLoggedIn && role === 'Admin' && (
              <motion.div className="relative">
                <button className="p-2 rounded-full hover:bg-purple-600/20 transition-colors">
                  <Bell size={18} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </motion.div>
            )}
            
            <motion.button 
              className="p-1" 
              onClick={toggleMenu}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={playHoverSound}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </nav>

        {/* Mobile Menu with Enhanced Animation */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-black/90 backdrop-blur-md px-4 py-4 space-y-4 text-white text-base font-medium border-t border-white/10"
            >
              {navItems.map((item, index) => (
                <MobileNavItem
                  key={index}
                  label={item.label}
                  href={item.href}
                  onClick={() => {
                    closeMenu();
                    playHoverSound();
                  }}
                  isActive={`#${activeSection}` === item.href}
                />
              ))}
              {isLoggedIn && role === 'Admin' && (
                <MobileNavItem
                  label="Upload Project"
                  href="/UploadProject"
                  onClick={() => {
                    closeMenu();
                    playHoverSound();
                  }}
                  isLink={true}
                />
              )}
              {/* Only show logout button if logged in */}
              {isLoggedIn && (
                <motion.button
                  onClick={() => {
                    onLogout();
                    closeMenu();
                    playHoverSound();
                  }}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-center transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Logout
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

function NavItem({ icon, label, href, isActive, onHover }) {
  const handleClick = (e) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      
      if (element) {
        // Get header height
        const headerHeight = document.querySelector('header').offsetHeight;
        
        // Get the absolute top position of the element relative to the document
        const elementOffset = element.getBoundingClientRect().top + window.pageYOffset;
        
        // Scroll to exactly the start position of the element minus the header height
        window.scrollTo({
          top: elementOffset - headerHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all ${
        isActive 
          ? 'bg-purple-600/30 text-purple-300 shadow-md' 
          : 'hover:bg-purple-600/20 hover:backdrop-blur-md hover:shadow-md hover:text-purple-300'
      }`}
      onMouseEnter={onHover}
    >
      {icon}
      {label}
    </a>
  );
}

function MobileNavItem({ label, href, onClick, isLink, isActive }) {
  const className = `block px-4 py-2 rounded transition-colors ${
    isActive ? 'bg-purple-700/40 text-purple-300' : 'hover:bg-purple-700/30'
  }`;
  
  const handleClick = (e) => {
    // For regular hash links, prevent default and handle the scroll ourselves
    if (href.startsWith('#') && !isLink) {
      e.preventDefault();
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      
      if (element) {
        // Close the menu first
        onClick();
        
        // Wait a bit for the menu to close then scroll
        setTimeout(() => {
          // Get header height
          const headerHeight = document.querySelector('header').offsetHeight;
          
          // Get the absolute top position of the element relative to the document
          const elementOffset = element.getBoundingClientRect().top + window.pageYOffset;
          
          // Scroll to exactly the start position of the element minus the header height
          window.scrollTo({
            top: elementOffset - headerHeight,
            behavior: 'smooth'
          });
        }, 300);
      } else {
        onClick();
      }
    } else {
      onClick();
    }
  };
  
  if (isLink) {
    return (
      <Link
        to={href}
        onClick={handleClick}
        className={className}
      >
        {label}
      </Link>
    );
  }
  
  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
    >
      {label}
    </a>
  );
}