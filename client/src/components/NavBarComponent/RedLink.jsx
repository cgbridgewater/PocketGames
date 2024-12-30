import { Link } from "react-router-dom";

export default function RedLink({ href, text, external }) {
    return (
        // Handle if external is True
        external === true ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="active_link redlink">
                <span>{text}</span>
            </a>
        ) : (
            <Link className="active_link redlink" to={href}>
                <span>{text}</span>
            </Link>
        )
    );
}