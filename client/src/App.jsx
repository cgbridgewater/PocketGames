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

function App() {

  const [isWinningModalOpen, setIsWinningModalOpen] = useState(false);

  return (

    <BrowserRouter>
    {/* Navbar Here */}
    <Navbar />

      <Routes>
        {/* GAME MENU */}
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

        {/* Lights Out GAME */}
        <Route path='/games/lightsout' element={
          <LightsOut
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
          />}
        />

        {/* Stack It GAME */}
        <Route path='/games/stackable' element={
          <Stackable
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
          />}
        />


        {/* Tetris GAME */}
        <Route path='/games/tetris' element={
            <Tetris
              isWinningModalOpen={isWinningModalOpen} 
              setIsWinningModalOpen={setIsWinningModalOpen}
            />}
          />

        {/* Color Fusion GAME */}
        <Route path='/games/colorfusion' element={
            <ColorFusion
              isWinningModalOpen={isWinningModalOpen} 
              setIsWinningModalOpen={setIsWinningModalOpen}
            />}
          />

        {/* Bubble Blast GAME */}
        <Route path='/games/bubblemania' element={
            <BubbleMania
              isWinningModalOpen={isWinningModalOpen} 
              setIsWinningModalOpen={setIsWinningModalOpen}
            />}
          />

        {/* 3D Stacking GAME */}
        {/* <Route path='/games/stacker3d' element={
          <Stacker3d
            isWinningModalOpen={isWinningModalOpen} 
            setIsWinningModalOpen={setIsWinningModalOpen}
          />}
        /> */}

        <Route path="*" element={
          <BadURL/>
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default App