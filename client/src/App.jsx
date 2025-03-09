// Import Style
import "./App.css"

// Import React Magic
import React, { Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Import Components
import Navbar from './components/NavBarComponent/Navbar';
const Index = React.lazy(() => import('./views/Index'));
const GameMenu = React.lazy(() => import('./views/GamesMenu'));
const Memory = React.lazy(() => import('./views/Memory'));
const SimonSays = React.lazy(() => import('./views/SimonSays'));
const Wordle = React.lazy(() => import('./views/Wordle'));
const BadURL = React.lazy(() => import('./views/BadURL'));
const LightsOut = React.lazy(() => import('./views/LightsOut'));
const Stackable = React.lazy(() => import('./views/Stackable'));
const Tetris = React.lazy(() => import('./views/Tetris'));
const ColorFusion = React.lazy(() => import('./views/ColorFusion'));
const Sudoku = React.lazy(() => import('./views/Sudoku'));
const BubbleBlast = React.lazy(() => import('./views/BubbleBlast'));
import MiniGolfGame from "./views/MiniGolf";
// const Stacker3d = React.lazy(() => import('./views/Stacker3d'));
import FutoshikiGame from "./views/Futoshiki";
import GoldRush from "./views/GoldRush";

// Import custom hooks
import useLoadMetaData from './customHooks/useLoadMetaData';
import useUpdateMetaData from './customHooks/useUpdateMetaData';

function App() {
  const [isWinningModalOpen, setIsWinningModalOpen] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <BrowserRouter>
        <AppContent 
          isWinningModalOpen={isWinningModalOpen} 
          setIsWinningModalOpen={setIsWinningModalOpen} 
          isTimerPaused={isTimerPaused}
          setIsTimerPaused={setIsTimerPaused}
        />
      </BrowserRouter>
    </Suspense>
  );
}

function AppContent({ isWinningModalOpen, setIsWinningModalOpen, isTimerPaused, setIsTimerPaused }) {
  const location = useLocation();

  // Fetch metadata from custom hook
  const metaData = useLoadMetaData();

  // Update document title and meta tags using custom hook
  useUpdateMetaData(metaData);

  return (
    <>
      {/* NAVBAR */}
      <Navbar currentPath={location.pathname} />

      <Routes>
        {/* LANDING PAGE */}
        <Route exact path='/' element={<Index />} />

        {/* GAME MENU */}
        <Route path='/games' element={<GameMenu />} />

        {/* MEMORY GAME */}
        <Route path='/games/memory' element={
          <Memory
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
            isTimerPaused={isTimerPaused}
            setIsTimerPaused={setIsTimerPaused}
          />} 
        />

        {/* SIMON GAME */}
        <Route path='/games/simon' element={
          <SimonSays 
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
            isTimerPaused={isTimerPaused}
            setIsTimerPaused={setIsTimerPaused}
          />}/>
        
        {/* WORDLE GAME */}
        <Route path='/games/wordle' element={
          <Wordle 
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
            isTimerPaused={isTimerPaused}
            setIsTimerPaused={setIsTimerPaused}
          />}/>

        {/* LIGHTS OUT GAME */}
        <Route path='/games/lightsout' element={
          <LightsOut
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
            isTimerPaused={isTimerPaused}
            setIsTimerPaused={setIsTimerPaused}
          />}/>

        {/* STACKABLE GAME */}
        <Route path='/games/stackit' element={
          <Stackable
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
            isTimerPaused={isTimerPaused}
            setIsTimerPaused={setIsTimerPaused}
          />}/>

        {/* TETRIS GAME */}
        <Route path='/games/tetris' element={
          <Tetris
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
            isTimerPaused={isTimerPaused}
            setIsTimerPaused={setIsTimerPaused}
          />}/>

        {/* COLOR FUSION GAME */}
        <Route path='/games/colorfusion' element={
          <ColorFusion
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
            isTimerPaused={isTimerPaused}
            setIsTimerPaused={setIsTimerPaused}
          />}/>

        {/* BUBBLE MANIA GAME */}
        <Route path='/games/sudoku' element={
          <Sudoku
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
            isTimerPaused={isTimerPaused}
            setIsTimerPaused={setIsTimerPaused}
          />}/>

        {/* BUBBLE BLAST GAME */}
        <Route path='/games/bubbleblast' element={
          <BubbleBlast
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
            isTimerPaused={isTimerPaused}
            setIsTimerPaused={setIsTimerPaused}
          />}/>

        {/* TREASURE HUNT GAME */}
        <Route path='/games/GoldRush' element={
          <GoldRush
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
            isTimerPaused={isTimerPaused}
            setIsTimerPaused={setIsTimerPaused}
          />}/>

        {/* Mini Golf GAME */}
        <Route path='/games/minigolf' element={
          <MiniGolfGame
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
            isTimerPaused={isTimerPaused}
            setIsTimerPaused={setIsTimerPaused}
          />}/>

        {/* STACKER 3D GAME */}
        {/* <Route path='/games/stacker3d' element={
          <Stacker3d
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
            isTimerPaused={isTimerPaused}
            setIsTimerPaused={setIsTimerPaused}
          />}/> */}

        {/* STACKER 3D GAME */}
        <Route path='/games/futoshiki' element={
          <FutoshikiGame
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
            isTimerPaused={isTimerPaused}
            setIsTimerPaused={setIsTimerPaused}
          />}/>

        {/* CATCHALL FOR BAD ROUTES */}
        <Route path="*" element={<BadURL />} />
      </Routes>
    </>
  );
}

export default App;