import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/NavBarComponent/Navbar'
import GameMenu from './views/GamesMenu'
import SimonSays from './views/SimonSays'
import Wordle from './views/Wordle'
import Memory from './views/Memory'
import Stackable from './views/Stackable'
import Index from './views/Index'
import BadURL from './views/BadURL'

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

        {/* Stackable GAME */}
        <Route path='/games/stackable' element={
          <Stackable
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