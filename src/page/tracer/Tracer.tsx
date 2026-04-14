import { useState } from "react";
import axios from "axios";
import s from "./tracer.module.css";

export const Tracer = () => {
  const [query, setQuery] = useState(""); 
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    if (!query.includes("#")) {
      setError("Введите Name#Tag");
      return;
    }

    setLoading(true);
    setError("");
    const [name, tag] = query.split("#");

    try {
      // Стучимся на наш бэкенд (регион eu)
      const res = await axios.get(`http://localhost:5000/api/v1/stats/eu/${name}/${tag}`);
      setData(res.data.data);
    } catch (err) {
      setError("Игрок не найден. Проверьте ник и тег.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.container}>
      <h1 className={s.title}>VALORANT TRACKER</h1>
      
      <div className={s.searchBox}>
        <input 
          placeholder="Nickname#Tag" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={s.input}
        />
        <button onClick={fetchStats} className={s.button}>
          {loading ? "..." : "SEARCH"}
        </button>
      </div>

      {error && <p style={{color: '#ff4655'}}>{error}</p>}

      {data && (
        <div className={s.card}>
          <h2>{data.name} <span style={{color: '#768079'}}>#{data.tag}</span></h2>
          <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px'}}>
             <img src={data.images?.small} alt="rank" style={{width: '60px'}} />
             <div>
                <p style={{fontSize: '20px', fontWeight: 'bold'}}>{data.currenttierpatched}</p>
                <p style={{color: '#ff4655'}}>{data.ranking_in_tier} RR</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
