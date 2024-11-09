import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import GameMenu from './views/GamesMenu'
import SimonSays from './views/SimonSays'
import Wordle from './views/Wordle'
import Memory from './views/Memory'
import Navbar from './components/NavBarComponent/Navbar'
import Index from './views/Index'

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
      </Routes>
    </BrowserRouter>
  )
}

export default App