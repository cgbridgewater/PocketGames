// /src/components/PowerBar/PowerBar.jsx
import React, { useState, useEffect } from "react";

// Converts polar coordinates (in degrees) to cartesian coordinates.
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

// Returns an SVG arc path given center, radius, start angle, and sweep angle.
function describeArc(x, y, radius, startAngle, sweepAngle) {
  const endAngle = startAngle + sweepAngle;
  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);
  const largeArcFlag = sweepAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

const PowerBar = ({
  onPowerCapture,
  onPowerUpdate,  // Callback to send the current oscillated power as a percentage.
  isActive,       // True when the oscillation should run.
  fixedPercentage // When not oscillating, use this fixed value.
}) => {
  const minPower = 2;
  const maxPower = 20;
  const intervalTime = 50; // ms between updates
  const step = 1;
  const [power, setPower] = useState(minPower);
  const [increasing, setIncreasing] = useState(true);
  const [hover, setHover] = useState(false);

  // Reset the power value to minPower whenever the gauge is activated.
  useEffect(() => {
    if (isActive) {
      setPower(minPower);
      setIncreasing(true);
    }
  }, [isActive]);

  // Oscillation effect.
  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      setPower(prev => {
        let next = increasing ? prev + step : prev - step;
        if (next >= maxPower) {
          next = maxPower;
          setIncreasing(false);
        } else if (next <= minPower) {
          next = minPower;
          setIncreasing(true);
        }
        return next;
      });
    }, intervalTime);
    return () => clearInterval(id);
  }, [increasing, isActive]);

  // Update parent's state.
  useEffect(() => {
    if (isActive && onPowerUpdate) {
      const percentage = Math.round(((power - minPower) / (maxPower - minPower)) * 100);
      onPowerUpdate(percentage);
    }
  }, [power, isActive, onPowerUpdate]);

  const displayPercentage = isActive
    ? Math.round(((power - minPower) / (maxPower - minPower)) * 100)
    : (fixedPercentage !== undefined ? fixedPercentage : 0);

  // Gauge dimensions.
  const containerSize = 85; // overall SVG container size
  const center = containerSize / 2; // 42.5
  const buttonDiameter = 65; // Shoot button diameter
  const gaugeThickness = 9; // Gauge arc thickness
  const buttonRadius = buttonDiameter / 2; // 32.5

  // We'll set up the gauge radius so it wraps around the button.
  const gaugeRadius = buttonRadius + gaugeThickness / 2;  
  const outerBorderRadius = gaugeRadius + gaugeThickness / 2; 

  // We want an arc from 7 o'clock to 5 o'clock, which is typically a 270° sweep.
  // You can adjust start/sweep angles if you prefer different coverage.
  const gaugeStart = 270; // starting angle (in degrees)
  const gaugeSweep = 270; // total sweep in degrees
  const activeSweep = (displayPercentage / 100) * gaugeSweep;

  // The main arcs: background and active.
  const backgroundArc = describeArc(center, center, gaugeRadius, gaugeStart, gaugeSweep);
  const activeArc = describeArc(center, center, gaugeRadius, gaugeStart, activeSweep);

  // MARKERS at 0% (start) and 100% (end):
  // We'll draw small lines that straddle the arc’s radius by +/- 2px.
  // So each marker is a short line from radius-2 to radius+2 along the same angle.
  const markerLength = 2; // half the line length in px
  const startAngle = gaugeStart;           // 0% angle
  const endAngle = gaugeStart + gaugeSweep; // 100% angle

  // A helper to produce the line endpoints for each marker.
  const makeMarkerLine = (angle) => {
    // Outer point (radius+markerLength)
    const outer = polarToCartesian(center, center, gaugeRadius + markerLength, angle);
    // Inner point (radius-markerLength)
    const inner = polarToCartesian(center, center, gaugeRadius - markerLength, angle);
    return { outer, inner };
  };

  // Create the marker lines.
  const marker0 = makeMarkerLine(startAngle);  // start
  const marker100 = makeMarkerLine(endAngle);  // end

  return (
    <div style={{ position: "relative", width: `${containerSize}px`, height: `${containerSize}px`, margin: "0 auto" }}>
      <svg
        width={containerSize}
        height={containerSize}
        viewBox={`0 0 ${containerSize} ${containerSize}`}
        style={{ overflow: "visible", backgroundColor:"black", borderRadius:"50%" }}
      >
        {/* Outer border around the gauge */}
        <circle cx={center} cy={center} r={outerBorderRadius + 1} fill="none" stroke="#D9B14B" strokeWidth="2" />

        {/* Full gauge background arc */}
        <path 
          d={backgroundArc} 
          fill="none" 
          stroke="#242424" 
          strokeWidth={gaugeThickness} 
          strokeLinecap="butt" 
        />
        {/* Active power arc */}
        <path 
          d={activeArc} 
          fill="none" 
          stroke="#991843" 
          strokeWidth={gaugeThickness} 
          strokeLinecap="butt" 
        />

        {/* Markers at 0% and 100% */}
        <line
          x1={marker0.inner.x+2}
          y1={marker0.inner.y}
          x2={marker0.outer.x-2}
          y2={marker0.outer.y}
          stroke="#D9B14B"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1={marker100.inner.x}
          y1={marker100.inner.y-2}
          x2={marker100.outer.x}
          y2={marker100.outer.y+2}
          stroke="#D9B14B"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Centered circular Shoot button */}
      <button
        onClick={() => onPowerCapture(power)}
        disabled={!isActive}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: "absolute",
          top: `${(containerSize - buttonDiameter) / 2}px`,
          left: `${(containerSize - buttonDiameter) / 2}px`,
          width: `${buttonDiameter}px`,
          height: `${buttonDiameter}px`,
          borderRadius: "50%",
          border: "2px solid #D9B14B",
          background: hover ? "#991843" : "#242424",
          color: "#E5D5D5",
          fontSize: "14px",
          fontWeight: "bold",
          cursor: isActive ? "pointer" : "default",
          outline: "none",
          WebkitTapHighlightColor: "transparent"
        }}
      >
        Shoot!
      </button>
    </div>
  );
};

export default PowerBar;
