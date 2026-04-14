import { Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/Header/Header";
import { Tracer } from "./page/tracer/Tracer";
import { Main } from "./page/main/Main";
import { About } from "./page/about/about"
import s from "./App.module.css"; 


function App() {
  return (
    <div className={s.appWrapper}>

      <Header />

      <main className={s.mainContent}>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/tracer" element={<Tracer />} />
          <Route path="/about" element={<About />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
