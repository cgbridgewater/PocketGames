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
// const BubbleMania = React.lazy(() => import('./views/BubbleMania'));
const Stacker3d = React.lazy(() => import('./views/Stacker3d'));
import FutoshikiGame from "./views/Futoshiki";

// Import custom hooks
import useLoadMetaData from './customHooks/useLoadMetaData';
import useUpdateMetaData from './customHooks/useUpdateMetaData';

function App() {
  const [isWinningModalOpen, setIsWinningModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <AppContent 
          isWinningModalOpen={isWinningModalOpen} 
          setIsWinningModalOpen={setIsWinningModalOpen} 
        />
      </Suspense>
    </BrowserRouter>
  );
}

function AppContent({ isWinningModalOpen, setIsWinningModalOpen }) {
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
          />} 
        />

        {/* SIMON GAME */}
        <Route path='/games/simon' element={
          <SimonSays 
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
          />}/>
        
        {/* WORDLE GAME */}
        <Route path='/games/wordle' element={
          <Wordle 
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
          />}/>

        {/* LIGHTS OUT GAME */}
        <Route path='/games/lightsout' element={
          <LightsOut
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
          />}/>

        {/* STACKABLE GAME */}
        <Route path='/games/stackit' element={
          <Stackable
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
          />}/>

        {/* TETRIS GAME */}
        <Route path='/games/tetris' element={
          <Tetris
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
          />}/>

        {/* COLOR FUSION GAME */}
        <Route path='/games/colorfusion' element={
          <ColorFusion
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
          />}/>

        {/* BUBBLE MANIA GAME */}
        <Route path='/games/sudoku' element={
          <Sudoku
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
          />}/>

        {/* BUBBLE MANIA GAME */}
        {/* <Route path='/games/bubblemania' element={
          <BubbleMania
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
          />}/> */}

        {/* STACKER 3D GAME */}
        <Route path='/games/stacker3d' element={
          <Stacker3d
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
          />}/>

        {/* STACKER 3D GAME */}
        <Route path='/games/futoshiki' element={
          <FutoshikiGame
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
          />}/>

        {/* CATCHALL FOR BAD ROUTES */}
        <Route path="*" element={<BadURL />} />
      </Routes>
    </>
  );
}

export default App;