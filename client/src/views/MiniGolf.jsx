// /src/MiniGolfGame.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import GameHeader from "../components/GameHeader/GameHeader";
import WinningModal from "../components/Modals/WinningModal";
import NextHole from "../components/MiniGolfGame/NextHoleModal";
import PowerBar from "../components/MiniGolfGame/PowerBar";
import holeData from "../assets/Json/holes.json";

const MiniGolfGame = ({ isWinningModalOpen, setIsWinningModalOpen, isTimerPaused, setIsTimerPaused }) => {
  // Game state
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [strokes, setStrokes] = useState(0);
  const [isAiming, setIsAiming] = useState(false);
  const [aimTarget, setAimTarget] = useState(null); // {x, y}
  const [aimPercentage, setAimPercentage] = useState(0); // (no longer displayed)
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [powerBarActive, setPowerBarActive] = useState(false);
  const [currentShotPercentage, setCurrentShotPercentage] = useState(0);

  // New state for accumulated score and modal type.
  const [accumulatedScore, setAccumulatedScore] = useState(0);
  // modalType: "next" (for holes 1-8) or "winning" (hole 9) or null.
  const [modalType, setModalType] = useState(null);

  const canvasRef = useRef(null);
  const requestRef = useRef();
  // Prevent multiple score calculations for a single hole.
  const holeCompletedRef = useRef(false);

  const currentHole = holeData[currentHoleIndex];
  const ballRadius = 10;
  const currentPar = currentHole.par || 3;

  // Force modals closed when component mounts.
  useEffect(() => {
    setModalType(null);
  }, []);

  // When the hole changes, reset states and clear the hole-completed flag.
  useEffect(() => {
    if (currentHole) {
      setBallPos({ ...currentHole.ballStart });
      setVelocity({ x: 0, y: 0 });
      setAimTarget(null);
      setAimPercentage(0);
      setIsAiming(false);
      setPowerBarActive(false);
      setModalType(null);
      setCurrentShotPercentage(0);
      holeCompletedRef.current = false;
    }
  }, [currentHole]);

  // Updated resetGame: explicitly reset all relevant states.
  const resetGame = () => {
    setCurrentHoleIndex(0);
    setStrokes(0);
    setAccumulatedScore(0);
    setModalType(null);
    setIsWinningModalOpen(false);
    // Explicitly reset ball and aim state.
    setBallPos({ ...holeData[0].ballStart });
    setVelocity({ x: 0, y: 0 });
    setAimTarget(null);
    setIsAiming(false);
    setPowerBarActive(false);
    holeCompletedRef.current = false;
  };

  const nextHole = () => {
    if (currentHoleIndex < holeData.length - 1) {
      setCurrentHoleIndex(prev => prev + 1);
      setStrokes(0);
      setModalType(null);
    }
  };

  const handleCanvasClick = (e) => {
    if (Math.hypot(velocity.x, velocity.y) > 0.1) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    setAimTarget({ x: clickX, y: clickY });
    setIsAiming(true);
    setPowerBarActive(true);

    const fullDistance = Math.hypot(currentHole.holePos.x - ballPos.x, currentHole.holePos.y - ballPos.y);
    const clickDistance = Math.hypot(clickX - ballPos.x, clickY - ballPos.y);
    const fixedAimPercentage = Math.round((clickDistance / fullDistance) * 100);
    setAimPercentage(fixedAimPercentage);
  };

  const onPowerCapture = (power) => {
    if (!aimTarget) return;
    const dx = aimTarget.x - ballPos.x;
    const dy = aimTarget.y - ballPos.y;
    const dist = Math.hypot(dx, dy);
    const norm = { x: dx / dist, y: dy / dist };

    const newVelocity = { x: norm.x * power, y: norm.y * power };
    setVelocity(newVelocity);
    setStrokes(prev => prev + 1);
    const shotPercentage = Math.round(((power - 2) / (20 - 2)) * 100);
    setCurrentShotPercentage(shotPercentage);
    setIsAiming(false);
    setPowerBarActive(false);
  };

  const distanceToSegment = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (dx === 0 && dy === 0) {
      return { distance: Math.hypot(px - x1, py - y1), closest: { x: x1, y: y1 } };
    }
    const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
    const tClamped = Math.max(0, Math.min(1, t));
    const closestX = x1 + tClamped * dx;
    const closestY = y1 + tClamped * dy;
    const distance = Math.hypot(px - closestX, py - closestY);
    return { distance, closest: { x: closestX, y: closestY } };
  };

  const reflectVelocity = (vx, vy, normalX, normalY) => {
    const dot = vx * normalX + vy * normalY;
    return { x: vx - 2 * dot * normalX, y: vy - 2 * dot * normalY };
  };

  const update = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the hole.
    ctx.beginPath();
    ctx.arc(currentHole.holePos.x, currentHole.holePos.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();

    // Draw obstacles.
    if (currentHole.obstacles) {
      currentHole.obstacles.forEach(obstacle => {
        if (obstacle.type === "wall") {
          if (obstacle.segments && obstacle.segments.length) {
            obstacle.segments.forEach(segment => {
              const { start, end } = segment;
              ctx.beginPath();
              ctx.moveTo(start.x, start.y);
              ctx.lineTo(end.x, end.y);
              ctx.strokeStyle = "#D9B14B";
              ctx.lineWidth = 4;
              ctx.stroke();

              const { distance, closest } = distanceToSegment(
                ballPos.x + velocity.x * 0.47,
                ballPos.y + velocity.y * 0.47,
                start.x,
                start.y,
                end.x,
                end.y
              );
              if (distance < ballRadius) {
                const wallDx = end.x - start.x;
                const wallDy = end.y - start.y;
                const norm1 = { x: -wallDy, y: wallDx };
                const norm2 = { x: wallDy, y: -wallDx };
                const len1 = Math.hypot(norm1.x, norm1.y);
                const n1 = { x: norm1.x / len1, y: norm1.y / len1 };
                const len2 = Math.hypot(norm2.x, norm2.y);
                const n2 = { x: norm2.x / len2, y: norm2.y / len2 };

                const dot1 = velocity.x * n1.x + velocity.y * n1.y;
                const dot2 = velocity.x * n2.x + velocity.y * n2.y;
                const chosenNormal = dot1 < dot2 ? n1 : n2;

                const reflected = reflectVelocity(velocity.x, velocity.y, chosenNormal.x, chosenNormal.y);
                velocity.x = reflected.x;
                velocity.y = reflected.y;
                ballPos.x = closest.x + chosenNormal.x * (ballRadius + 0.5);
                ballPos.y = closest.y + chosenNormal.y * (ballRadius + 0.5);
              }
            });
          } else if (obstacle.points && obstacle.points.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(obstacle.points[0].x, obstacle.points[0].y);
            for (let i = 1; i < obstacle.points.length; i++) {
              ctx.lineTo(obstacle.points[i].x, obstacle.points[i].y);
            }
            ctx.strokeStyle = "orange";
            ctx.lineWidth = 4;
            ctx.stroke();
          }
        }
      });
    }

    // Draw the ball.
    ctx.beginPath();
    ctx.arc(ballPos.x, ballPos.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#E5D5D5";
    ctx.fill();

    // Draw dashed aim line (no percentage text).
    if (isAiming && aimTarget) {
      const dx = aimTarget.x - ballPos.x;
      const dy = aimTarget.y - ballPos.y;
      const dist = Math.hypot(dx, dy);
      const clampedDist = Math.min(dist, 100);
      const normX = dx / dist;
      const normY = dy / dist;
      const endX = ballPos.x + normX * clampedDist;
      const endY = ballPos.y + normY * clampedDist;
      ctx.beginPath();
      ctx.moveTo(ballPos.x, ballPos.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = "#991843";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    let speed = Math.hypot(velocity.x, velocity.y);
    let newX = ballPos.x;
    let newY = ballPos.y;
    let newVelocity = { ...velocity };

    if (speed > 0.1) {
      newX += velocity.x * 0.75;
      newY += velocity.y * 0.75;
      if (newX < ballRadius) {
        newX = ballRadius;
        newVelocity.x = -newVelocity.x;
      } else if (newX > canvas.width - ballRadius) {
        newX = canvas.width - ballRadius;
        newVelocity.x = -newVelocity.x;
      }
      if (newY < ballRadius) {
        newY = ballRadius;
        newVelocity.y = -newVelocity.y;
      } else if (newY > canvas.height - ballRadius) {
        newY = canvas.height - ballRadius;
        newVelocity.y = -newVelocity.y;
      }
      setBallPos({ x: newX, y: newY });
      const friction = 0.983;
      setVelocity({ x: newVelocity.x * friction, y: newVelocity.y * friction });
    } else {
      if (velocity.x !== 0 || velocity.y !== 0) {
        setVelocity({ x: 0, y: 0 });
        setCurrentShotPercentage(0);
      }
    }

    const distToHole = Math.hypot(ballPos.x - currentHole.holePos.x, ballPos.y - currentHole.holePos.y);
    if (distToHole < 13 && modalType === null && !holeCompletedRef.current) {
      setBallPos({ x: currentHole.holePos.x, y: currentHole.holePos.y });
      setVelocity({ x: 0, y: 0 });
      holeCompletedRef.current = true;
      const holeDiff = strokes - currentPar;
      setAccumulatedScore(prev => prev + holeDiff);
      if (currentHole.hole === 9) {
        setModalType("winning");
      } else {
        setModalType("next");
      }
      return;
    }

    requestRef.current = requestAnimationFrame(update);
  }, [ballPos, velocity, currentHole, isAiming, aimTarget, strokes, currentPar, modalType]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  const ballMoving = Math.hypot(velocity.x, velocity.y) > 0.1;

  function getFinalScore() {
    if (accumulatedScore === 0) {
      return "at par!";
    } else if (accumulatedScore < 0) {
      return `${Math.abs(accumulatedScore)} under par!`;
    } else {
      return `${accumulatedScore} over par!`;
    }
  }

  return (
    <main style={{ position: "relative" }}>
      <GameHeader 
        title="Mini Golf" 
        onclick={resetGame}
        turn_title={""}  
        turns={0}
        howTo="Click anywhere on the hole to aim, then adjust power with the gauge and press Shoot."
        isTimerPaused={isTimerPaused}
        setIsTimerPaused={setIsTimerPaused}
      />

      {modalType === "winning" && (
        <WinningModal 
          message1={`Round Complete.`} 
          message2={getFinalScore()}
          turns={""}
          onClose={resetGame}
        />
      )}
      {modalType === "next" && (
        <NextHole
          message1={`Hole ${currentHole.hole} Completed`}
          message2={accumulatedScore === 0 ? "Score: EVEN" : `Score: ${accumulatedScore}`}
          turns={strokes}
          onClose={nextHole}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems:"center", width: "320px", margin: "-32px auto 8px" }}>
        <div style={{ textAlign: "left" }}>
          <p><b>Hole:</b> <span style={{ color: "#D9B14B" }}>{currentHole.hole}</span></p>
          <p><b>Par:</b> <span style={{ color: "#D9B14B" }}>{currentPar}</span></p>
          <p><b>Score:</b> <span style={{ color: "#D9B14B" }}>{accumulatedScore === 0 ? "EVEN" : accumulatedScore}</span></p>
          <p><b>Strokes:</b> <span style={{ color: "#D9B148" }}>{strokes}</span></p>
        </div>
        <div>
          <PowerBar 
            onPowerCapture={onPowerCapture} 
            onPowerUpdate={(percentage) => setCurrentShotPercentage(percentage)}
            isActive={powerBarActive}
            fixedPercentage={ballMoving ? currentShotPercentage : undefined}
          />
        </div>
      </div>

      <canvas 
        ref={canvasRef}
        width={360} 
        height={500} 
        style={{ border: "4px solid #D9B14B", display: "block", display: "flex", justifyContent: "center", alignItems:"center",marginBottom: "8px", backgroundColor: "#193200" }}
        onClick={handleCanvasClick}
      />
    </main>
  );
};

export default MiniGolfGame;
