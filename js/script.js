/**
 * Constants for DOM selectors and class names
 * @type {Object}
 */
const CONSTANTS = {
    SELECTORS: {
      HAMBURGER: 'hamburger',
      NAV_LINKS: 'nav-links',
      BODY: 'body',
    },
    CLASSES: {
      OPEN: 'open',
      ACTIVE: 'active',
      NO_SCROLL: 'no-scroll',
    },
    FOCUSABLE_ELEMENTS:
      'a[href], area[href], input:not([disabled]), select:not([disabled]), ' +
      'textarea:not([disabled]), button:not([disabled]), iframe, object, embed, ' +
      '[contenteditable], [tabindex]:not([tabindex="-1"])',
  };
  
  /**
   * Utility function to debounce a function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function}
   */
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  /**
   * Navigation menu controller
   */
  class NavigationController {
    /**
     * Initialize the navigation controller
     */
    constructor() {
      // DOM Elements
      this.hamburger = document.getElementById(CONSTANTS.SELECTORS.HAMBURGER);
      this.navLinks = document.getElementById(CONSTANTS.SELECTORS.NAV_LINKS);
      this.body = document.querySelector(CONSTANTS.SELECTORS.BODY);
  
      // State
      this.isAnimating = false;
      this.touchStartY = 0;
      this.focusableElements = [];
      this.firstFocusableElement = null;
      this.lastFocusableElement = null;
  
      // Bind methods
      this.handleOutsideClick = this.handleOutsideClick.bind(this);
      this.trapTabKey = this.trapTabKey.bind(this);
      this.handleResize = debounce(this.handleResize.bind(this), 150);
      this.handleTouchStart = this.handleTouchStart.bind(this);
      this.handleTouchMove = this.handleTouchMove.bind(this);
  
      // Initialize
      this.initialize();
    }
  
    /**
     * Initialize event listeners and check for required elements
     */
    initialize() {
      if (!this.hamburger || !this.navLinks) {
        console.error('Required navigation elements not found!');
        return;
      }
      this.setupEventListeners();
      window.addEventListener('resize', this.handleResize);
      this.navLinks.addEventListener('touchstart', this.handleTouchStart);
      this.navLinks.addEventListener('touchmove', this.handleTouchMove);
    }
  
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
      try {
          // Hamburger click and keyboard events
          this.hamburger.addEventListener('click', () => this.toggleMenu());
          this.hamburger.addEventListener('keydown', (e) => this.handleHamburgerKeydown(e));
  
          // Navigation link click events (close the menu and scroll)
const navLinkItems = this.navLinks.querySelectorAll('a');
      navLinkItems.forEach((link) => {
          link.addEventListener('click', (event) => {
              event.preventDefault(); // Prevent default anchor link behavior

              // Get the target section
              const sectionId = link.getAttribute('href').substring(1); // Get the ID without '#'
              const section = document.getElementById(sectionId);

              // Close the menu first
              this.closeMenu();

              // Smooth scroll to the section
              if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
              }
          });
      });
      } catch (error) {
          console.error('Error setting up event listeners:', error);
      }
  }
  
    /**
     * Toggle the navigation menu state
     */
    toggleMenu() {
      if (this.isAnimating) return;
      this.isAnimating = true;
      try {
        const isOpen = this.navLinks.classList.toggle(CONSTANTS.CLASSES.OPEN);
        this.hamburger.classList.toggle(CONSTANTS.CLASSES.ACTIVE);
        this.hamburger.setAttribute('aria-expanded', isOpen);
        this.body.classList.toggle(CONSTANTS.CLASSES.NO_SCROLL, isOpen);
  
        if (isOpen) {
          this.handleMenuOpen();
        } else {
          this.handleMenuClose();
        }
  
        setTimeout(() => {
          this.isAnimating = false;
        }, 300); // Match with CSS transition duration
      } catch (error) {
        console.error('Error toggling menu:', error);
        this.isAnimating = false;
      }
    }
  
    /**
     * Handle menu open state
     */
    handleMenuOpen() {
      this.focusableElements = Array.from(this.navLinks.querySelectorAll(CONSTANTS.FOCUSABLE_ELEMENTS));
      if (this.focusableElements.length > 0) {
        this.firstFocusableElement = this.focusableElements[0];
        this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
        this.firstFocusableElement.focus();
      }
      document.addEventListener('keydown', this.trapTabKey);
      document.addEventListener('click', this.handleOutsideClick);
    }
  
    /**
     * Handle menu close state
     */
    handleMenuClose() {
      document.removeEventListener('keydown', this.trapTabKey);
      document.removeEventListener('click', this.handleOutsideClick);
      this.body.classList.remove(CONSTANTS.CLASSES.NO_SCROLL);
      this.hamburger.focus();
    }
  
    /**
     * Close the navigation menu
     */
    closeMenu() {
      if (this.navLinks.classList.contains(CONSTANTS.CLASSES.OPEN)) {
        this.navLinks.classList.remove(CONSTANTS.CLASSES.OPEN);
        this.hamburger.classList.remove(CONSTANTS.CLASSES.ACTIVE);
        this.hamburger.setAttribute('aria-expanded', 'false');
        this.handleMenuClose();
      }
    }
  
    /**
     * Handle click events outside the navigation menu
     * @param {MouseEvent} event - Click event
     */
    handleOutsideClick(event) {
      const isClickInside = this.navLinks.contains(event.target) || this.hamburger.contains(event.target);
      if (!isClickInside) {
        this.closeMenu();
      }
    }
  
    /**
     * Handle keyboard events for the hamburger button
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleHamburgerKeydown(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleMenu();
      }
    }
  
    /**
     * Trap the tab key within the navigation menu
     * @param {KeyboardEvent} e - Keyboard event
     */
    trapTabKey(e) {
      if (e.key === 'Escape') {
        this.closeMenu();
        return;
      }
  
      if (e.key === 'Tab') {
        if (this.focusableElements.length === 0) {
          e.preventDefault();
          return;
        }
  
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === this.firstFocusableElement) {
            e.preventDefault();
            this.lastFocusableElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === this.lastFocusableElement) {
            e.preventDefault();
            this.firstFocusableElement.focus();
          }
        }
      }
    }
  
    /**
     * Handle touch start event for swipe detection
     * @param {TouchEvent} e - Touch event
     */
    handleTouchStart(e) {
      this.touchStartY = e.touches[0].clientY;
    }
  
    /**
     * Handle touch move event for swipe detection
     * @param {TouchEvent} e - Touch event
     */
    handleTouchMove(e) {
      if (!this.navLinks.classList.contains(CONSTANTS.CLASSES.OPEN)) return;
      const touchEndY = e.touches[0].clientY;
      const diff = touchEndY - this.touchStartY;
      if (diff > 50) {
        this.closeMenu();
      }
    }
  
    /**
     * Handle window resize event
     */
    handleResize() {
      if (window.innerWidth > 768) {
        this.closeMenu();
      }
    }
  }

/**
 * Toggle the hamburger menu when the logo is clicked
 */
function toggleHamburgerMenu() {
  const hamburger = document.getElementById(CONSTANTS.SELECTORS.HAMBURGER);
  const navLinks = document.getElementById(CONSTANTS.SELECTORS.NAV_LINKS);
  const body = document.querySelector(CONSTANTS.SELECTORS.BODY);

  if (navLinks.classList.contains(CONSTANTS.CLASSES.OPEN)) {
      navLinks.classList.remove(CONSTANTS.CLASSES.OPEN);
      hamburger.classList.remove(CONSTANTS.CLASSES.ACTIVE);
      hamburger.setAttribute('aria-expanded', 'false');
      body.classList.remove(CONSTANTS.CLASSES.NO_SCROLL);
  } else {
      navLinks.classList.add(CONSTANTS.CLASSES.OPEN);
      hamburger.classList.add(CONSTANTS.CLASSES.ACTIVE);
      hamburger.setAttribute('aria-expanded', 'true');
      body.classList.add(CONSTANTS.CLASSES.NO_SCROLL);
  }
}
  
  // Initialize navigation when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    new NavigationController();
  });
