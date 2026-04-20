import mainImg from "../../components/imgForMainPage.png"
import { Link } from "react-router";
import Eclips1 from "../../components/figure/Ellipse1.png"
import Eclips2 from "../../components/figure/Ellipse2.png"
import Eclips3 from "../../components/figure/Ellipse3.png"
import s from "./main.module.css"

export const Main = () => {

    return(
        <>
        <div className={s.container}>
            <img className={s.blackdEclips} src={Eclips2} alt="" />
            <div className={s.textContainer}>
                <h1 className={s.mainTextRed}>Valorant</h1>
                <h1 className={s.mainTextWhite}>Stats</h1>
                <h2>Check your statistics right now!</h2>
                <img className={s.redEclips} src={Eclips1} alt="" />
                <div>
                    <Link to="/tracer" className={s.link}>let's look at the statistics</Link>
                </div>
            </div>
        </div>
        <div className={s.rightContainer}>
            <img className={s.mainImg} src={mainImg} alt="" />
        </div>
        </>
    )
}