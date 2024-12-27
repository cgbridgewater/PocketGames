import React, { useState } from 'react';
import { Link } from "react-router-dom";
import PocketGamesIcon from "../../assets/images/PocketGames.png";
import NavDrawer from './NavDrawer';

export default function Navbar({ currentPath }) {
    const [isChecked, setIsChecked] = useState(false);

    const handleNavClick = () => {
        setIsChecked(prev => !prev);
    };

    return (
        <>
            {/* HAMBURGER CHECKBOX */}
            <input
                type="checkbox"
                id="drawer_toggle"
                name="drawer_toggle"
                checked={isChecked}
                onChange={handleNavClick}
            />
            {/* HAMBURGER LABEL */}
            <label  htmlFor="drawer_toggle" id="drawer_toggle_label" >
                <span className="visually_hidden">Toggle Drawer</span>
            </label>
            {/* NAV HEADER */}
            <header>
                <Link to="/games">
                    <img className="logo" src={PocketGamesIcon} alt="Pocket Games" />
                </Link>
            </header>

            {/* SLIDE OUT DRAWER FOR HAMBURGER */}
            <NavDrawer currentPath={currentPath} handleNavClick={handleNavClick} />
        </>
    );
}
