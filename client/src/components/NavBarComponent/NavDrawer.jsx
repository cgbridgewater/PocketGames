import RedLink from "./RedLink";

export default function NavDrawer() {
    return (
        <nav id="drawer">
            <ul>
                <li className="drawer_link">
                    <RedLink href="/" text="Home" external={false} />
                </li>
                <li className="drawer_link">
                    <RedLink href="/games" text="Games Menu" external={false} />
                </li>
                <li className="drawer_link">
                    <RedLink href="/games/memory" text="Memory Magic" external={false} />
                </li>
                <li className="drawer_link">
                    <RedLink href="/games/simon" text="Simom Says" external={false} />
                </li>
                <li className="drawer_link">
                    <RedLink href="/games/wordle" text="Wordle" external={false} />
                </li>
                <li className="drawer_link">
                    <RedLink href="/games/lightsout" text="Lights Out" external={false} />
                </li>
            </ul>
        </nav>
    );
};