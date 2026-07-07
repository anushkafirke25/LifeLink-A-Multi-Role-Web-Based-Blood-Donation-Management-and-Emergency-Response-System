import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({});

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' }
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const toggle = () => {
    const willOpen = !open;
    if (willOpen) {
      const btn = buttonRef.current;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setMenuStyle({ position: 'absolute', top: `${rect.bottom + window.scrollY}px`, left: `${rect.left + window.scrollX}px`, minWidth: `${rect.width}px` });
      }
    }
    setOpen(willOpen);
  };

  useEffect(() => {
    if (!open) return;

    const btn = buttonRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuStyle({ position: 'absolute', top: `${rect.bottom + window.scrollY}px`, left: `${rect.left + window.scrollX}px`, minWidth: `${rect.width}px` });
    }

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    const onDown = (e) => {
      const m = menuRef.current;
      const b = buttonRef.current;
      if (!m || !b) return;
      if (!m.contains(e.target) && !b.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);

    // focus first item for keyboard users without scrolling the page
    requestAnimationFrame(() => {
      const first = menuRef.current?.querySelector('button');
      try {
        first?.focus({ preventScroll: true });
      } catch (e) {
        // fallback for browsers that do not support preventScroll
        first?.focus();
      }
    });

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="language-switcher-menu"
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 transition-all"
        type="button"
      >
        <span className="text-lg">🌐</span>
        <span className="text-sm font-medium hidden sm:inline">
          {languages.find(lang => lang.code === i18n.language)?.name || 'English'}
        </span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && createPortal(
        <div id="language-switcher-menu" ref={menuRef} style={menuStyle} className="bg-white rounded-xl shadow-lg transition-all duration-200 z-50">
          {languages.map((lang, idx) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors ${
                i18n.language === lang.code ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700'
              } ${idx === 0 ? 'rounded-t-xl' : ''} ${idx === languages.length - 1 ? 'rounded-b-xl' : ''}`}
              type="button"
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="text-sm">{lang.name}</span>
              {i18n.language === lang.code && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default LanguageSwitcher;

