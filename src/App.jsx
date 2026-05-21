import { useEffect, useRef, useState } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { CompassPlugin } from '@photo-sphere-viewer/compass-plugin';
import { MapPlugin } from '@photo-sphere-viewer/map-plugin';
import Header from './components/Header';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Importación de Estilos
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/compass-plugin/index.css';
import '@photo-sphere-viewer/map-plugin/index.css';

const galleryItems = [
  {
    id: 'frontis',
    name: 'Frontis',
    type: '360',
    panorama: './frontis.jpg',
    thumbnail: './frontis.jpg',
  },
  {
    id: 'centro',
    name: 'Centro',
    type: '360',
    panorama: './centro.jpg',
    thumbnail: './centro.jpg',
  },
  {
    id: 'panoramico',
    name: 'Panorámico',
    type: '360',
    panorama: './panoramico.jpg',
    thumbnail: './panoramico.jpg',
  },
  {
    id: 'vista1',
    name: 'Vista 1',
    type: '2D',
    panorama: './vista1.jpg',
    thumbnail: './vista1.jpg',
  },
  {
    id: 'vista2',
    name: 'Vista 2',
    type: '2D',
    panorama: './vista2.jpg',
    thumbnail: './vista2.jpg',
  },
  {
    id: 'vista3',
    name: 'Vista 3',
    type: '2D',
    panorama: './vista3.jpg',
    thumbnail: './vista3.jpg',
  },
];

function App() {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activePanoId, setActivePanoId] = useState('frontis');
  const [selected2DImage, setSelected2DImage] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new Viewer({
      container: containerRef.current,
      panorama: './frontis.jpg',
      caption: 'Vista Frontis 360',
      plugins: [
        [CompassPlugin, {
          position: 'top right',
          hotspots: [
            { yaw: '0deg' }, { yaw: '90deg' }, { yaw: '180deg' }, { yaw: '270deg' },
          ],
        }],
        [MapPlugin, {
          imageUrl: './minimapa.png',
          center: { x: 512, y: 800 },
          rotation: '0deg',
          shape: 'square',
          size: '180px',
          position: 'bottom left',
          hotspots: [
            {
              id: 'frontis',
              x: 512,
              y: 800,
              color: '#00d2ff',
              tooltip: 'Frontis (360°)',
            },
            {
              id: 'centro',
              x: 512,
              y: 512,
              color: '#00d2ff',
              tooltip: 'Centro (360°)',
            },
            {
              id: 'panoramico',
              x: 800,
              y: 250,
              color: '#00d2ff',
              tooltip: 'Panorámico (360°)',
            },
            {
              id: 'vista1',
              x: 250,
              y: 300,
              color: '#ffffff',
              tooltip: 'Vista 1 (Foto)',
            },
            {
              id: 'vista2',
              x: 250,
              y: 700,
              color: '#ffffff',
              tooltip: 'Vista 2 (Foto)',
            },
            {
              id: 'vista3',
              x: 750,
              y: 700,
              color: '#ffffff',
              tooltip: 'Vista 3 (Foto)',
            },
          ],
        }],
      ],
      navbar: [
        'zoom',
        {
          id: 'custom-gallery',
          title: 'Galería de Vistas',
          content: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>`,
          onClick: () => {
            setIsGalleryOpen((open) => !open);
          },
        },
        'caption',
        'fullscreen',
      ],
    });

    viewerRef.current = viewer;

    const mapPlugin = viewer.getPlugin(MapPlugin);
    if (mapPlugin) {
      mapPlugin.addEventListener('select-hotspot', (e) => {
        const item = galleryItems.find((i) => i.id === e.hotspotId);
        if (item) {
          if (item.type === '360') {
            setSelected2DImage(null);
            viewer.setPanorama(item.panorama, {
              caption: `Vista ${item.name} 360`,
            });
            setActivePanoId(item.id);
          } else {
            setSelected2DImage(item);
          }
        }
      });
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  // Update map center when active panorama changes from gallery/keyboard navigation
  useEffect(() => {
    if (!viewerRef.current) return;
    const mapPlugin = viewerRef.current.getPlugin(MapPlugin);
    if (mapPlugin) {
      const coords = {
        frontis: { x: 512, y: 800 },
        centro: { x: 512, y: 512 },
        panoramico: { x: 800, y: 250 },
      };
      const activeCoords = coords[activePanoId];
      if (activeCoords) {
        mapPlugin.setCenter(activeCoords);
      }
    }
  }, [activePanoId]);

  const handleItemClick = (item) => {
    if (item.type === '360') {
      setSelected2DImage(null);
      if (viewerRef.current) {
        viewerRef.current.setPanorama(item.panorama, {
          caption: `Vista ${item.name} 360`,
        });
        setActivePanoId(item.id);
      }
    } else {
      setSelected2DImage(item);
    }
  };

  const navigateView = (direction) => {
    let currentIndex = 0;
    if (selected2DImage) {
      currentIndex = galleryItems.findIndex((item) => item.id === selected2DImage.id);
    } else {
      currentIndex = galleryItems.findIndex((item) => item.id === activePanoId);
    }

    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % galleryItems.length;
    } else {
      newIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    }

    const nextItem = galleryItems[newIndex];
    handleItemClick(nextItem);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        navigateView('next');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        navigateView('prev');
      } else if (e.key === 'Escape') {
        setSelected2DImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePanoId, selected2DImage]);

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Header />
      <div style={{ width: '100%', height: '100%' }} ref={containerRef}></div>

      {/* Botones de navegación flotantes */}
      <button className="floating-nav-btn nav-btn-left" onClick={() => navigateView('prev')} title="Anterior (Flecha Izquierda / A)">
        <ChevronLeft size={24} />
      </button>
      <button className="floating-nav-btn nav-btn-right" onClick={() => navigateView('next')} title="Siguiente (Flecha Siguiente / D)">
        <ChevronRight size={24} />
      </button>

      {/* Galería Custom */}
      <div className={`custom-gallery-dock ${isGalleryOpen ? 'open' : ''}`}>
        {galleryItems.map((item) => (
          <div
            key={item.id}
            className={`custom-gallery-item ${item.type === '360' && activePanoId === item.id ? 'active' : ''}`}
            onClick={() => handleItemClick(item)}
          >
            <span className={`custom-gallery-badge ${item.type === '360' ? 'badge-360' : 'badge-2d'}`}>
              {item.type === '360' ? '360°' : 'Foto'}
            </span>
            <img src={item.thumbnail} alt={item.name} className="custom-gallery-thumb" />
            <div className="custom-gallery-label">{item.name}</div>
          </div>
        ))}
      </div>

      {/* Modal para fotos 2D */}
      <div className={`photo-modal-overlay ${selected2DImage ? 'open' : ''}`} onClick={() => setSelected2DImage(null)}>
        {selected2DImage && (
          <div className="photo-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={() => setSelected2DImage(null)}>
              <X size={24} />
            </button>
            <img src={selected2DImage.panorama} alt={selected2DImage.name} className="photo-modal-img" />
            <div className="photo-modal-caption">{selected2DImage.name}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
