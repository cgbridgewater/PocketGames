import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/NavBarComponent/Navbar'
import Index from './views/Index'
import GameMenu from './views/GamesMenu'
import Memory from './views/Memory'
import SimonSays from './views/SimonSays'
import Wordle from './views/Wordle'
import BadURL from './views/BadURL'
import LightsOut from './views/LightsOut'
import Stackable from './views/Stackable'
import Tetris from './views/Tetris'
import ColorFusion from './views/ColorFusion'
import BubbleMania from './views/BubbleMania'
import Stacker3d from './views/Stacker3d'

function App() {

  // State for winning modal //
  const [isWinningModalOpen, setIsWinningModalOpen] = useState(false);

  return (

    <BrowserRouter>
    {/* NAVBAR */}
    <Navbar />

      <Routes>
        {/* LANDING PAGE */}
        <Route exact path='/' element={
          <Index
          />}
        />

        {/* GAME MENU */}
        <Route path='/games' element={
          <GameMenu
          />} 
        />

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
          />}
        />

        {/* WORDLE GAME */}
        <Route path='/games/wordle' element={
          <Wordle 
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
          />}
        />

        {/* LIGHTS OUT GAME */}
        <Route path='/games/lightsout' element={
          <LightsOut
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
          />}
        />

        {/* STACKABLE GAME */}
        <Route path='/games/stackable' element={
          <Stackable
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
          />}
        />


        {/* TETRIS GAME */}
        <Route path='/games/tetris' element={
            <Tetris
              isWinningModalOpen={isWinningModalOpen} 
              setIsWinningModalOpen={setIsWinningModalOpen}
            />}
          />

        {/* COLOR FUSION GAME */}
        <Route path='/games/colorfusion' element={
            <ColorFusion
              isWinningModalOpen={isWinningModalOpen} 
              setIsWinningModalOpen={setIsWinningModalOpen}
            />}
          />

        {/* BUBBLE MANIA GAME */}
        <Route path='/games/bubblemania' element={
            <BubbleMania
              isWinningModalOpen={isWinningModalOpen} 
              setIsWinningModalOpen={setIsWinningModalOpen}
            />}
          />

        {/* 3D Stacking GAME */}
        <Route path='/games/stacker3d' element={
          <Stacker3d
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
          />}
        />

        <Route path="*" element={
          <BadURL/>
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default App