// Card Liquid Glass Effect - Performance Optimized
// Adapted from Shu Ding's liquid glass effect for card elements

(function() {
  'use strict';
  
  // Performance monitoring
  let frameCount = 0;
  let lastTime = 0;
  let fps = 60;
  let performanceMode = 'high'; // 'high', 'medium', 'low'
  
  // Utility functions - optimized versions
  function smoothStep(a, b, t) {
    t = Math.max(0, Math.min(1, (t - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  // Fast length calculation using approximation for better performance
  function fastLength(x, y) {
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    const max = Math.max(absX, absY);
    const min = Math.min(absX, absY);
    return max + min * 0.414213562373095; // Approximation of sqrt(2) - 1
  }

  function length(x, y) {
    return Math.sqrt(x * x + y * y);
  }

  function roundedRectSDF(x, y, width, height, radius) {
    const qx = Math.abs(x) - width + radius;
    const qy = Math.abs(y) - height + radius;
    return Math.min(Math.max(qx, qy), 0) + fastLength(Math.max(qx, 0), Math.max(qy, 0)) - radius;
  }

  function texture(x, y) {
    return { type: 't', x, y };
  }

  // Generate unique ID
  function generateId() {
    return 'card-liquid-glass-' + Math.random().toString(36).substr(2, 9);
  }

  // Global SVG container for all filters
  let globalSVGContainer = null;
  let globalDefs = null;

  // Initialize global SVG container
  function initGlobalSVG() {
    if (!globalSVGContainer) {
      globalSVGContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      globalSVGContainer.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      globalSVGContainer.setAttribute('width', '0');
      globalSVGContainer.setAttribute('height', '0');
      globalSVGContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 1;
      `;

      globalDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      globalSVGContainer.appendChild(globalDefs);
      document.body.appendChild(globalSVGContainer);
    }
  }

  // Card Liquid Glass class - Performance Optimized
  class CardLiquidGlass {
    constructor(cardElement) {
      this.card = cardElement;
      this.id = generateId();
      this.animationId = null;
      this.time = 0;
      this.lastUpdateTime = 0;
      this.frameSkip = 0;
      this.maxFrameSkip = 2; // Skip frames if performance is low
      this.isVisible = true;
      this.performanceMode = 'high';
      
      // Pre-calculate common values
      this.halfWidth = 0;
      this.halfHeight = 0;
      this.invWidth = 0;
      this.invHeight = 0;
      
      this.init();
    }

    init() {
      // Initialize global SVG container
      initGlobalSVG();
      
      // Get card dimensions
      const rect = this.card.getBoundingClientRect();
      this.width = Math.floor(rect.width);
      this.height = Math.floor(rect.height);
      
      // Pre-calculate common values for performance
      this.halfWidth = this.width * 0.5;
      this.halfHeight = this.height * 0.5;
      this.invWidth = 1 / this.width;
      this.invHeight = 1 / this.height;
      
      // Create SVG filter
      this.createSVGFilter();
      
      // Apply liquid glass effect to card
      this.applyLiquidGlassEffect();
      
      // Set up visibility detection
      this.setupVisibilityDetection();
      
      // Start animation loop
      this.startAnimation();
    }

    createSVGFilter() {
      // Create filter element
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.setAttribute('id', `${this.id}_filter`);
      filter.setAttribute('filterUnits', 'userSpaceOnUse');
      filter.setAttribute('colorInterpolationFilters', 'sRGB');
      filter.setAttribute('x', '0');
      filter.setAttribute('y', '0');
      filter.setAttribute('width', this.width.toString());
      filter.setAttribute('height', this.height.toString());

      this.feImage = document.createElementNS('http://www.w3.org/2000/svg', 'feImage');
      this.feImage.setAttribute('id', `${this.id}_map`);
      this.feImage.setAttribute('width', this.width.toString());
      this.feImage.setAttribute('height', this.height.toString());

      this.feDisplacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
      this.feDisplacementMap.setAttribute('in', 'SourceGraphic');
      this.feDisplacementMap.setAttribute('in2', `${this.id}_map`);
      this.feDisplacementMap.setAttribute('xChannelSelector', 'R');
      this.feDisplacementMap.setAttribute('yChannelSelector', 'G');

      filter.appendChild(this.feImage);
      filter.appendChild(this.feDisplacementMap);
      
      // Add filter to global defs
      globalDefs.appendChild(filter);

      // Create canvas for displacement map
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.canvas.style.display = 'none';
      this.context = this.canvas.getContext('2d');
    }

    applyLiquidGlassEffect() {
      // Apply backdrop filter with displacement
      this.card.style.backdropFilter = `url(#${this.id}_filter) blur(0.5px) contrast(1.1) brightness(1.05) saturate(1.1)`;
      this.card.style.webkitBackdropFilter = `url(#${this.id}_filter) blur(0.5px) contrast(1.1) brightness(1.05) saturate(1.1)`;
    }

    setupVisibilityDetection() {
      // Use Intersection Observer for better performance
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            this.isVisible = entry.isIntersecting;
            if (!this.isVisible) {
              this.frameSkip = 0; // Reset frame skip when becoming visible
            }
          });
        }, { threshold: 0.1 });
        
        this.observer.observe(this.card);
      }
    }

    startAnimation() {
      const animate = (currentTime) => {
        // Performance monitoring
        if (currentTime - lastTime >= 1000) {
          fps = frameCount;
          frameCount = 0;
          lastTime = currentTime;
          
          // Adjust performance mode based on FPS
          if (fps < 30) {
            this.performanceMode = 'low';
            this.maxFrameSkip = 3;
          } else if (fps < 45) {
            this.performanceMode = 'medium';
            this.maxFrameSkip = 2;
          } else {
            this.performanceMode = 'high';
            this.maxFrameSkip = 1;
          }
        }
        
        frameCount++;
        
        // Skip frames if performance is low or card is not visible
        if (!this.isVisible || this.frameSkip < this.maxFrameSkip) {
          this.frameSkip++;
          this.animationId = requestAnimationFrame(animate);
          return;
        }
        
        this.frameSkip = 0;
        this.time += 0.016; // ~60fps
        this.updateShader();
        this.animationId = requestAnimationFrame(animate);
      };
      animate(0);
    }

    stopAnimation() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }



    updateShader() {
      const w = Math.floor(this.width);
      const h = Math.floor(this.height);
      
      // Ensure valid dimensions
      if (w <= 0 || h <= 0) {
        console.warn('Invalid canvas dimensions:', w, h);
        return;
      }
      
      // Reuse data array if possible to reduce garbage collection
      if (!this.dataArray || this.dataArray.length !== w * h * 4) {
        this.dataArray = new Uint8ClampedArray(w * h * 4);
        this.rawValuesArray = new Float32Array(w * h * 2);
      }
      
      const data = this.dataArray;
      const rawValues = this.rawValuesArray;
      const dataLength = w * h * 4;
      const rawValuesLength = w * h * 2;

      let maxScale = 0;
      let rawIndex = 0;

      // Optimize loop with pre-calculated values
      const invW = this.invWidth;
      const invH = this.invHeight;
      
      for (let i = 0; i < dataLength; i += 4) {
        const pixelIndex = i >> 2; // i / 4
        const x = pixelIndex % w;
        const y = (pixelIndex - x) / w;
        
        const pos = this.fragment({ x: x * invW, y: y * invH });
        const dx = pos.x * w - x;
        const dy = pos.y * h - y;
        
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        maxScale = Math.max(maxScale, absDx, absDy);
        
        rawValues[rawIndex] = dx;
        rawValues[rawIndex + 1] = dy;
        rawIndex += 2;
      }

      maxScale *= 0.6; // Static liquid glass intensity
      const invMaxScale = 1 / maxScale;

      // Optimize data writing with bit operations
      rawIndex = 0;
      for (let i = 0; i < dataLength; i += 4) {
        const r = Math.max(0, Math.min(255, (rawValues[rawIndex] * invMaxScale + 0.5) * 255));
        const g = Math.max(0, Math.min(255, (rawValues[rawIndex + 1] * invMaxScale + 0.5) * 255));
        
        data[i] = r;     // R
        data[i + 1] = g; // G
        data[i + 2] = 0; // B
        data[i + 3] = 255; // A
        
        rawIndex += 2;
      }
      
      try {
        // Use ImageData constructor with existing data for better performance
        if (!this.imageData || this.imageData.width !== w || this.imageData.height !== h) {
          this.imageData = new ImageData(data, w, h);
        } else {
          // Reuse existing ImageData and copy data
          this.imageData.data.set(data);
        }
        
        this.context.putImageData(this.imageData, 0, 0);
        this.feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.canvas.toDataURL());
        this.feDisplacementMap.setAttribute('scale', maxScale.toString());
      } catch (error) {
        console.error('Error updating shader:', error);
      }
    }

    fragment(uv) {
      const ix = uv.x - 0.5;
      const iy = uv.y - 0.5;
      
      // Pre-calculate common values
      const centerDistance = fastLength(ix, iy);
      const time = this.time;
      
      // Performance-based effect intensity
      let effectIntensity = 1.0;
      if (this.performanceMode === 'low') {
        effectIntensity = 0.6;
      } else if (this.performanceMode === 'medium') {
        effectIntensity = 0.8;
      }
      
      // Primary liquid effect - optimized with pre-calculated values
      const liquidPhase = centerDistance * 15 + time * 2;
      const liquidStep = smoothStep(0.8, 0, centerDistance - 0.1);
      const liquidEffect1 = liquidStep * Math.sin(liquidPhase) * 0.3 * effectIntensity;
      
      // Secondary ripple effect - simplified for performance
      const ripplePhase = centerDistance * 25 + time * 1.5;
      const rippleStep = smoothStep(0.6, 0, centerDistance);
      const rippleEffect = Math.sin(ripplePhase) * rippleStep * 0.2 * effectIntensity;
      
      // Edge attraction effect - optimized
      const edgeDistance = Math.min(ix + 0.5, 0.5 - ix, iy + 0.5, 0.5 - iy);
      const edgeStep = smoothStep(0.2, 0, edgeDistance);
      const edgePhase = time * 0.5;
      const edgeEffect = edgeStep * 0.15 * (1 + Math.sin(edgePhase) * 0.3) * effectIntensity;
      
      // Simplified noise for better performance
      let noise = 0;
      if (this.performanceMode !== 'low') {
        const noisePhase1 = ix * 30 + time;
        const noisePhase2 = iy * 30 + time * 0.8;
        noise = Math.sin(noisePhase1) * Math.cos(noisePhase2) * 0.1 * effectIntensity;
      }
      
      // Additional wave effects - only for high performance mode
      let wave1 = 0, wave2 = 0;
      if (this.performanceMode === 'high') {
        const wave1Phase1 = ix * 8 + time * 3;
        const wave1Phase2 = iy * 6 + time * 2;
        wave1 = Math.sin(wave1Phase1) * Math.cos(wave1Phase2) * 0.05;
        
        const wave2Phase1 = ix * 12 + time * 1.2;
        const wave2Phase2 = iy * 10 + time * 1.8;
        wave2 = Math.sin(wave2Phase1) * Math.cos(wave2Phase2) * 0.03;
      }
      
      // Combine all effects
      const displacement = liquidEffect1 + rippleEffect + edgeEffect + noise + wave1 + wave2;
      
      return texture(
        ix * (1 - displacement) + 0.5, 
        iy * (1 - displacement) + 0.5
      );
    }

    destroy() {
      this.stopAnimation();
      
      // Clean up intersection observer
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      
      // Remove filter from global defs
      if (this.feImage && this.feImage.parentNode) {
        this.feImage.parentNode.remove();
      }
      
      if (this.canvas) {
        this.canvas.remove();
      }
      
      // Clean up arrays
      this.dataArray = null;
      this.rawValuesArray = null;
      this.imageData = null;
      
      this.card.style.backdropFilter = '';
      this.card.style.webkitBackdropFilter = '';
    }
  }

  // Global performance monitoring
  function updateGlobalPerformanceMode() {
    const instances = window.cardLiquidGlassInstances || [];
    if (instances.length === 0) return;
    
    // Calculate average performance mode
    let lowCount = 0, mediumCount = 0, highCount = 0;
    instances.forEach(instance => {
      if (instance.performanceMode === 'low') lowCount++;
      else if (instance.performanceMode === 'medium') mediumCount++;
      else highCount++;
    });
    
    // Update global performance mode
    if (lowCount > instances.length * 0.5) {
      performanceMode = 'low';
    } else if (mediumCount > instances.length * 0.3) {
      performanceMode = 'medium';
    } else {
      performanceMode = 'high';
    }
    
    // Apply global optimizations
    if (performanceMode === 'low') {
      // Reduce animation frequency globally
      instances.forEach(instance => {
        instance.maxFrameSkip = Math.max(instance.maxFrameSkip, 3);
      });
    }
  }

  // Initialize liquid glass effect on all cards
  function initCardLiquidGlass() {
    const cards = document.querySelectorAll('.card');
    
    if (cards.length === 0) {
      console.warn('No cards found for liquid glass effect, retrying...');
      // Retry after a short delay if no cards found
      setTimeout(() => {
        const retryCards = document.querySelectorAll('.card');
        if (retryCards.length > 0) {
          console.log('Cards found on retry, initializing...');
          initCardLiquidGlass();
        }
      }, 200);
      return;
    }

    const liquidGlassInstances = [];

    cards.forEach((card, index) => {
      try {
        // Check if card is visible and has dimensions
        const rect = card.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const instance = new CardLiquidGlass(card);
          liquidGlassInstances.push(instance);
        } else {
          console.warn(`Card ${index} has no dimensions, skipping`);
        }
      } catch (error) {
        console.error(`Failed to initialize liquid glass for card ${index}:`, error);
      }
    });

    // Store instances globally for cleanup
    window.cardLiquidGlassInstances = liquidGlassInstances;
    
    // Start global performance monitoring
    setInterval(updateGlobalPerformanceMode, 2000);
    
    console.log(`Liquid glass effect applied to ${liquidGlassInstances.length} cards`);
  }

  // Initialize when DOM is ready and all elements are rendered
  function initializeWhenReady() {
    // Wait a bit more to ensure all elements are fully rendered
    setTimeout(() => {
      initCardLiquidGlass();
    }, 100);
  }

  // Enhanced initialization with retry mechanism
  function enhancedInit() {
    let retryCount = 0;
    const maxRetries = 5;
    
    function tryInit() {
      const cards = document.querySelectorAll('.card');
      if (cards.length > 0) {
        initCardLiquidGlass();
      } else if (retryCount < maxRetries) {
        retryCount++;
        console.log(`No cards found, retrying... (${retryCount}/${maxRetries})`);
        setTimeout(tryInit, 200);
      } else {
        console.warn('Max retries reached, no cards found');
      }
    }
    
    tryInit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhancedInit);
  } else {
    enhancedInit();
  }

  // Also watch for DOM changes in case cards are added dynamically
  const observer = new MutationObserver((mutations) => {
    let shouldReinit = false;
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && (node.classList?.contains('card') || node.querySelector?.('.card'))) {
            shouldReinit = true;
          }
        });
      }
    });
    
    if (shouldReinit && !window.cardLiquidGlassInstances?.length) {
      console.log('New cards detected, reinitializing...');
      enhancedInit();
    }
  });

  // Only observe if document.body exists
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Enhanced cleanup function
  window.destroyCardLiquidGlass = function() {
    if (window.cardLiquidGlassInstances) {
      window.cardLiquidGlassInstances.forEach(instance => instance.destroy());
      window.cardLiquidGlassInstances = [];
    }
    
    // Clean up global SVG container
    if (globalSVGContainer) {
      globalSVGContainer.remove();
      globalSVGContainer = null;
      globalDefs = null;
    }
    
    // Reset global performance variables
    frameCount = 0;
    lastTime = 0;
    fps = 60;
    performanceMode = 'high';
    
    console.log('Card liquid glass effect cleaned up');
  };

  // Performance debugging function
  window.getCardLiquidGlassPerformance = function() {
    const instances = window.cardLiquidGlassInstances || [];
    return {
      instanceCount: instances.length,
      globalFPS: fps,
      globalPerformanceMode: performanceMode,
      instances: instances.map(instance => ({
        id: instance.id,
        performanceMode: instance.performanceMode,
        isVisible: instance.isVisible,
        frameSkip: instance.frameSkip,
        maxFrameSkip: instance.maxFrameSkip
      }))
    };
  };

  // Pause/resume functions for better resource management
  window.pauseCardLiquidGlass = function() {
    const instances = window.cardLiquidGlassInstances || [];
    instances.forEach(instance => {
      instance.stopAnimation();
    });
    console.log('Card liquid glass effect paused');
  };

  window.resumeCardLiquidGlass = function() {
    const instances = window.cardLiquidGlassInstances || [];
    instances.forEach(instance => {
      if (instance.isVisible) {
        instance.startAnimation();
      }
    });
    console.log('Card liquid glass effect resumed');
  };

})();
