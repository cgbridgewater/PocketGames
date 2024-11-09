import { useEffect } from 'react';
import { Link } from "react-router-dom";
import GameIcon from "../../assets/images/GameIcon.png";
import NavDrawer from './NavDrawer';

export default function Navbar() {
    // Handle clicks to close nav bar, either link or outside of drawer area
    useEffect(() => {
        const drawerLinks = document.querySelectorAll('.drawer_link');
        drawerLinks.forEach(link => { 
            link.addEventListener('click', () => { 
                document.getElementById('drawer_toggle').checked = false;
            });
        });
    }, []);

    return (
        <>
            {/* HAMBURGER CHECKBOX */}
            <input type="checkbox" id="drawer_toggle" name="drawer_toggle"/>
            {/* HAMBURGER */}
            <label htmlFor="drawer_toggle" id="drawer_toggle_label"><span className="visually_hidden">Empty Link</span></label>
            {/* NAV HEADER */}
            <header>
                <Link to="/">
                    <img className="logo" src={ GameIcon } alt="Pocket Games"/>
                </Link>
                <Link to="/games">
                    <h1>Pocket Games</h1>
                </Link>
            </header>
            {/* END HEADER */}
            {/* SLIDE OUT DRAWER FOR HAMBURGER */}
            <NavDrawer />
        </>
    );
};