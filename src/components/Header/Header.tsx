import s from "./headerstyle.module.css";
import { Link } from "react-router";

export const Header = () => {
    return (
        <header className={s.container}>
            <div className={s.logo}>VALORANT STATS</div>
            
            <nav className={s.nav}>
                <Link to="/" className={s.link}>Main</Link>
                <Link to="/about" className={s.link}>About</Link>
                <Link to="/agents" className={s.link}>Agents</Link>
            </nav>

            <div className={s.authp}>
                <button className={s.loginButton}>
                    LOGIN
                </button>
            </div>
        </header>        
    );
};
