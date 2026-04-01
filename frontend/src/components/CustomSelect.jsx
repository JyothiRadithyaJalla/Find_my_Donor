import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = value || placeholder;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', marginBottom: 0 }}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '0.7rem 1rem',
          background: 'white',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '10px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.95rem',
          minHeight: '42px',
          color: value ? 'var(--text-main)' : 'var(--text-muted)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.15)';
        }}
        onMouseLeave={e => {
          if (!isOpen) { 
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        <span>{selectedLabel}</span>
        <ChevronDown 
          size={16} 
          style={{ 
            transition: 'transform 0.3s ease', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--text-muted)'
          }} 
        />
      </div>

      {/* Custom Dropdown Menu - Pushes content down to avoid overlapping */}
      {isOpen && (
        <div 
          className="custom-scrollbar"
          style={{
            position: 'relative',
            marginTop: '8px',
            background: 'white',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            zIndex: 10,
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '6px',
            animation: 'fadeIn 0.2s ease forwards'
          }}
        >
          {/* Placeholder/Empty Option */}
          <div
            onClick={() => { onChange({ target: { name: 'area', value: '' } }); setIsOpen(false); }}
            style={{
              padding: '0.6rem 0.8rem',
              cursor: 'pointer',
              borderRadius: '8px',
              fontSize: '0.9rem',
              background: value === '' ? 'var(--bg-elevated)' : 'transparent',
              color: value === '' ? 'var(--accent-dark)' : 'var(--text-main)',
              fontWeight: value === '' ? 600 : 400
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-base)'}
            onMouseLeave={e => e.currentTarget.style.background = value === '' ? 'var(--bg-elevated)' : 'transparent'}
          >
            {placeholder}
          </div>
          
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onChange({ target: { name: 'area', value: opt } }); setIsOpen(false); }}
              style={{
                padding: '0.6rem 0.8rem',
                cursor: 'pointer',
                borderRadius: '8px',
                fontSize: '0.9rem',
                background: value === opt ? 'var(--bg-elevated)' : 'transparent',
                color: value === opt ? 'var(--accent-dark)' : 'var(--text-main)',
                fontWeight: value === opt ? 600 : 400
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-base)'}
              onMouseLeave={e => e.currentTarget.style.background = value === opt ? 'var(--bg-elevated)' : 'transparent'}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
