"use client";
import { useState, useEffect, useRef, CSSProperties } from "react";

export default function Home() {
  const [baseFood, setBaseFood] = useState<string>("");
  const [baseSuggestions, setBaseSuggestions] = useState<string[]>([]);
  const [baseQuantity, setBaseQuantity] = useState<string>("");
  const [substituteFood, setSubstituteFood] = useState<string>("");
  const [substituteSuggestions, setSubstituteSuggestions] = useState<string[]>([]);
  const [equivalence, setEquivalence] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  const baseFoodSelected = useRef<boolean>(false);
  const substituteFoodSelected = useRef<boolean>(false);

  const fetchSuggestions = async (
    query: string,
    setSuggestions: React.Dispatch<React.SetStateAction<string[]>>,
    foodSelected: React.RefObject<boolean>
  ) => {
    if (!query.trim() || foodSelected.current) {
      setSuggestions([]);
      foodSelected.current = false;
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/sugestoes?query=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error(`Erro na resposta do servidor: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setSuggestions(data.sugestoes || []);
    } catch (err) {
      console.error("Erro ao buscar sugestões:", err);
    }
  };

  useEffect(() => {
    fetchSuggestions(baseFood, setBaseSuggestions, baseFoodSelected);
  }, [baseFood]);

  useEffect(() => {
    fetchSuggestions(substituteFood, setSubstituteSuggestions, substituteFoodSelected);
  }, [substituteFood]);

  const handleSelectSuggestion = (
    food: string,
    setFood: React.Dispatch<React.SetStateAction<string>>,
    setSuggestions: React.Dispatch<React.SetStateAction<string[]>>,
    foodSelected: React.RefObject<boolean>
  ) => {
    setFood(food);
    setSuggestions([]);
    foodSelected.current = true;
    setError(null);
    setWarning(null);
    setShowResult(false);
  };

  const calculateEquivalence = async () => {
    if (!baseFood || !baseQuantity || !substituteFood || Number(baseQuantity) <= 0) {
      setError("Preencha todos os campos corretamente!");
      setShowResult(false);
      return;
    }

    setLoading(true);
    setError(null);
    setWarning(null);
    setShowResult(false);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(
        `${backendUrl}/api/equivalencia?baseFood=${encodeURIComponent(
          baseFood
        )}&baseQuantity=${encodeURIComponent(baseQuantity)}&substituteFood=${encodeURIComponent(substituteFood)}`
      );

      if (!response.ok) {
        throw new Error(`Erro na resposta do servidor: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.baseGroup && data.substituteGroup && data.baseGroup !== data.substituteGroup) {
        setWarning(
          `⚠️ Essa troca pode não ser ideal. O alimento "${baseFood}" pertence ao grupo "${data.baseGroup}" e o alimento "${substituteFood}" pertence ao grupo "${data.substituteGroup}". \nTente trocar alimentos do mesmo grupo para manter as propriedades nutricionais dentro do seu plano alimentar.`
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

  return (
    <div style={styles.container}>
      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Digite o alimento base"
          value={baseFood}
          onChange={(e) => {
            setBaseFood(e.target.value);
            setError(null);
            setWarning(null);
            setShowResult(false);
          }}
          style={styles.input}
        />
        {baseSuggestions.length > 0 && (
          <ul style={styles.suggestionsList}>
            {baseSuggestions.map((food, index) => (
              <li
                key={index}
                onClick={() => handleSelectSuggestion(food, setBaseFood, setBaseSuggestions, baseFoodSelected)}
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
          min="1"
          value={baseQuantity}
          onChange={(e) => {
            setBaseQuantity(e.target.value);
            setError(null);
            setWarning(null);
            setShowResult(false);
          }}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="Digite o alimento substituto"
          value={substituteFood}
          onChange={(e) => {
            setSubstituteFood(e.target.value);
            setError(null);
            setWarning(null);
            setShowResult(false);
          }}
          style={styles.input}
        />
        {substituteSuggestions.length > 0 && (
          <ul style={styles.suggestionsList}>
            {substituteSuggestions.map((food, index) => (
              <li
                key={index}
                onClick={() =>
                  handleSelectSuggestion(food, setSubstituteFood, setSubstituteSuggestions, substituteFoodSelected)
                }
                style={styles.suggestionItem}
              >
                {food}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={calculateEquivalence}
        style={{ 
          ...styles.button, 
          opacity: loading ? 0.6 : 1, 
          pointerEvents: loading ? "none" : "auto" 
        }}
        disabled={loading}
      >
        {loading ? "Calculando..." : "Calcular Substituição"}
      </button>

      {showResult && (
        <div className="centralizado">
          {equivalence && <p style={styles.result}>{equivalence}</p>}
          {error && <p style={styles.error}>{error}</p>}
          {warning && <p style={styles.warning}>{warning}</p>}
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    textAlign: "center",
    padding: "20px",
    fontFamily: "Poppins, sans-serif",
  },
  inputContainer: {
    marginBottom: "20px",
    position: "relative",
  },
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
  suggestionItem: {
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #ddd",
  },
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
  error: {
    color: "red",
    fontSize: "16px",
    marginTop: "15px",
  },
  warning: {
    color: "red",
    fontSize: "16px",
    marginTop: "15px",
    fontWeight: "bold",
  },
  result: {
    marginTop: "20px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#023013",
  },
};
