"use client";
import { useState, useEffect, useRef, type CSSProperties } from "react";

// URL fixa do backend em produção
const BASE_URL = "https://backend-production-e77b.up.railway.app";
// URL da função serverless (Netlify cuida do resto)
const PROXY_FORM_URL = "/.netlify/functions/proxyForm";

export default function Home() {
  const [baseFood, setBaseFood] = useState("");
  const [baseSuggestions, setBaseSuggestions] = useState<string[]>([]);
  const [baseQuantity, setBaseQuantity] = useState("");
  const [substituteFood, setSubstituteFood] = useState("");
  const [substituteSuggestions, setSubstituteSuggestions] = useState<string[]>([]);
  const [equivalence, setEquivalence] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const [suggestionInput, setSuggestionInput] = useState("");
  const [suggestionStatus, setSuggestionStatus] = useState("");

  const baseFoodSelected = useRef(false);
  const substituteFoodSelected = useRef(false);

  // Função genérica para buscar sugestões
  const fetchSuggestions = async (
    query: string,
    setSuggestions: (val: string[]) => void,
    foodSelected: React.MutableRefObject<boolean>
  ) => {
    if (!query.trim() || foodSelected.current) {
      setSuggestions([]);
      foodSelected.current = false;
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/api/sugestoes?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSuggestions(data.sugestoes || []);
    } catch (err) {
      console.error("Erro ao buscar sugestões:", err);
    }
  };

  // Efeitos para buscar sugestões enquanto digita
  useEffect(() => {
    fetchSuggestions(baseFood, setBaseSuggestions, baseFoodSelected);
  }, [baseFood]);

  useEffect(() => {
    fetchSuggestions(substituteFood, setSubstituteSuggestions, substituteFoodSelected);
  }, [substituteFood]);

  // Selecionar sugestão
  const handleSelectSuggestion = (
    food: string,
    setFood: (v: string) => void,
    setSuggestions: (v: string[]) => void,
    foodSelected: React.MutableRefObject<boolean>
  ) => {
    setFood(food);
    setSuggestions([]);
    foodSelected.current = true;
  };

  // Calcular equivalência
  const calculateEquivalence = async () => {
    if (!baseFood || !baseQuantity || !substituteFood) {
      setError("Preencha todos os campos!");
      setShowResult(false);
      return;
    }
    setLoading(true);
    setError(null);
    setWarning(null);
    setShowResult(false);

    try {
      const response = await fetch(
        `${BASE_URL}/api/equivalencia?baseFood=${encodeURIComponent(
          baseFood
        )}&baseQuantity=${encodeURIComponent(
          baseQuantity
        )}&substituteFood=${encodeURIComponent(substituteFood)}`
      );
      const data = await response.json();

      if (data.baseGroup && data.substituteGroup && data.baseGroup !== data.substituteGroup) {
        setWarning(
          `⚠️ Essa troca pode não ser ideal. "${baseFood}" pertence a "${data.baseGroup}" e "${substituteFood}" pertence a "${data.substituteGroup}".`
        );
      }

      setEquivalence(
        `${data.baseQuantity}g de ${data.baseFood} equivale a ${data.equivalentQuantity}g de ${data.substituteFood}`
      );
      setShowResult(true);
    } catch (err) {
      setError("Erro ao calcular substituição.");
      console.error("Erro ao buscar equivalência:", err);
      setShowResult(false);
    }

    setLoading(false);
  };

  // Enviar sugestão de novo alimento
  const enviarSugestao = async () => {
    if (!suggestionInput.trim()) {
      setSuggestionStatus("Digite um alimento para sugerir.");
      return;
    }
    try {
      const res = await fetch(PROXY_FORM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alimento: suggestionInput }),
      });

      if (res.ok) {
        setSuggestionStatus("✅ Sugestão enviada com sucesso!");
        setSuggestionInput("");
      } else {
        setSuggestionStatus("❌ Erro ao enviar sugestão.");
      }
    } catch (error) {
      console.error("Erro ao enviar sugestão:", error);
      setSuggestionStatus("❌ Erro ao enviar sugestão.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Calculadora de Substituição</h1>

      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Digite o alimento base"
          value={baseFood}
          onChange={(e) => setBaseFood(e.target.value)}
          style={styles.input}
        />
        {baseSuggestions.length > 0 && (
          <ul style={styles.suggestionsList}>
            {baseSuggestions.map((food, index) => (
              <li
                key={index}
                onClick={() =>
                  handleSelectSuggestion(
                    food,
                    setBaseFood,
                    setBaseSuggestions,
                    baseFoodSelected
                  )
                }
                style={styles.suggestionItem}
              >
                {food}
              </li>
            ))}
          </ul>
        )}

        <input
          type="number"
          placeholder="Quantidade em gramas"
          value={baseQuantity}
          onChange={(e) => setBaseQuantity(e.target.value)}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="Digite o alimento substituto"
          value={substituteFood}
          onChange={(e) => setSubstituteFood(e.target.value)}
          style={styles.input}
        />
        {substituteSuggestions.length > 0 && (
          <ul style={styles.suggestionsList}>
            {substituteSuggestions.map((food, index) => (
              <li
                key={index}
                onClick={() =>
                  handleSelectSuggestion(
                    food,
                    setSubstituteFood,
                    setSubstituteSuggestions,
                    substituteFoodSelected
                  )
                }
                style={styles.suggestionItem}
              >
                {food}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={calculateEquivalence} style={styles.button} disabled={loading}>
        {loading ? "Calculando..." : "Calcular Substituição"}
      </button>

      {showResult && (
        <div className="centralizado">
          {equivalence && <p style={styles.result}>{equivalence}</p>}
          {error && <p style={styles.error}>{error}</p>}
          {warning && <p style={styles.warning}>{warning}</p>}
        </div>
      )}

      <hr style={{ margin: "30px 0" }} />

      <div>
        <h2 style={styles.title}>Faltou algum alimento? Deixe sua sugestão:</h2>
        <input
          type="text"
          placeholder="Digite o alimento que deseja sugerir"
          value={suggestionInput}
          onChange={(e) => setSuggestionInput(e.target.value)}
          style={styles.input}
        />
        <button onClick={enviarSugestao} style={styles.button}>
          Enviar Sugestão
        </button>
        {suggestionStatus && <p style={{ marginTop: 10 }}>{suggestionStatus}</p>}
      </div>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: { textAlign: "center", padding: "20px", fontFamily: "Poppins, sans-serif" },
  title: { marginBottom: "20px", color: "#04451c" },
  inputContainer: { marginBottom: "20px", position: "relative" },
  input: {
    padding: "12px",
    borderRadius: "15px",
    border: "2px solid #094e22",
    width: "80%",
    fontSize: "16px",
    marginBottom: "10px",
    outline: "none",
  },
  suggestionsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: "5px",
    position: "absolute",
    width: "80%",
    maxHeight: "150px",
    overflowY: "auto",
    zIndex: 10,
  },
  suggestionItem: { padding: "10px", cursor: "pointer", borderBottom: "1px solid #ddd" },
  button: {
    backgroundColor: "#04451c",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "0.3s",
  },
  error: { color: "red", fontSize: "16px", marginTop: "15px" },
  warning: { color: "red", fontSize: "16px", marginTop: "15px", fontWeight: "bold" },
  result: { marginTop: "20px", fontSize: "18px", fontWeight: "bold", color: "#023013" },
};
