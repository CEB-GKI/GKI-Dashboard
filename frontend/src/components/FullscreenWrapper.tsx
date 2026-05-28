import React, { useRef, useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

export function FullscreenWrapper({ children, className = '', style = {} }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`fullscreen-wrapper ${className}`}
      style={{
        position: 'relative',
        backgroundColor: isFullscreen ? '#070B14' : undefined,
        padding: isFullscreen ? '32px' : undefined,
        overflowY: isFullscreen ? 'auto' : undefined,
        width: '100%',
        ...style
      }}
    >
      <button 
        onClick={toggleFullscreen}
        className="btn-icon"
        style={{
          position: 'absolute',
          top: isFullscreen ? '24px' : '16px',
          right: isFullscreen ? '24px' : '16px',
          zIndex: 9999,
          background: isFullscreen ? 'rgba(255,255,255,0.1)' : 'transparent',
          border: 'none',
          color: isFullscreen ? '#fff' : 'var(--text-secondary)',
          cursor: 'pointer',
          padding: isFullscreen ? '8px 12px' : '4px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        title={isFullscreen ? "Keluar Layar Penuh (ESC)" : "Layar Penuh"}
      >
        {isFullscreen ? (
          <>
            <Minimize2 size={20} /> <span style={{ fontSize: '0.9rem' }}>Tutup (ESC)</span>
          </>
        ) : (
          <Maximize2 size={20} />
        )}
      </button>
      
      <div style={{ 
        height: isFullscreen ? '100%' : 'auto', 
        width: '100%', 
        minHeight: isFullscreen ? '100vh' : 'auto',
        display: isFullscreen ? 'flex' : 'block',
        flexDirection: isFullscreen ? 'column' : undefined
      }}>
        <div style={{ margin: isFullscreen ? 'auto 0' : undefined, width: '100%' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
