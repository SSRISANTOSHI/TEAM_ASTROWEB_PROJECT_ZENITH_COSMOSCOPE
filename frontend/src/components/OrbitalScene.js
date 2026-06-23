import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function OrbitalScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Cyan planet core (representing the digital twin)
    const coreGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const coreMat = new THREE.MeshPhongMaterial({ 
      color: 0x00ffc8, 
      emissive: 0x00ffc8, 
      emissiveIntensity: 0.3,
      shininess: 100,
      transparent: true,
      opacity: 0.4
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Dynamic orbital rings
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(2 + i * 0.5, 0.015, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({ 
        color: 0x00ffc8, 
        transparent: true, 
        opacity: 0.2 
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      group.add(ring);
      rings.push(ring);
    }

    // Lights
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    camera.position.z = 5;

    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      group.rotation.y += 0.003;
      group.rotation.x += 0.001;
      core.rotation.z += 0.005;
      
      // Slightly rotate rings individually
      rings.forEach((ring, idx) => {
        ring.rotation.z += 0.002 * (idx + 1);
      });

      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="orbital-container" 
      style={{ 
        position: 'absolute', 
        inset: 0, 
        zIndex: 0, 
        pointerEvents: 'none', 
        opacity: 0.6 
      }} 
    />
  );
}
