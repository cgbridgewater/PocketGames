// src/components/Explosion.jsx
import React, { useEffect } from 'react';

const NUM_PARTICLES = 40;

const Explosion = ({ id, x, y, value, primaryColor, onComplete }) => {
  // Create particles with randomized directions and distances.
  const particles = Array.from({ length: NUM_PARTICLES }).map((_, i) => {
    // Generate a random angle (in degrees) and distance.
    const angle = Math.random() * 360;
    const distance = Math.random() * 30 + 20; // Adjust for spread.
    // Multiply the distance to give a more dynamic explosion.
    const radians = angle * (Math.PI / 180);
    const offsetX = Math.cos(radians) * distance * 3;
    const offsetY = Math.sin(radians) * distance * 3;
    // Randomly choose a particle color from a subset of gem colors.
    const availableColors = ['blue', 'green', 'yellow', 'red', 'orange', 'purple'];
    const particleColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    return { id: `${id}-${i}`, offsetX, offsetY, color: particleColor };
  });

  // Remove this explosion after the animation completes.
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(id);
    }, 1500); // Should match the animation duration.
    return () => clearTimeout(timer);
  }, [id, onComplete]);

  return (
    <div className="explosion-container" style={{ left: x, top: y }}>
      <div className="explosion-value" style={{ color: primaryColor }}>
        {value}
      </div>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="explosion-particle"
          style={{
            backgroundColor: particle.color,
            '--offsetX': `${particle.offsetX}px`,
            '--offsetY': `${particle.offsetY}px`,
          }}
        />
      ))}
    </div>
  );
};

export default Explosion;
