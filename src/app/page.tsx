"use client";
import { useState, useEffect, useRef } from "react";

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

  // Tipos explicitos para os parâmetros da função
  const fetchSuggestions = async (
    query: string,
    setSuggestions: React.Dispatch<React.SetStateAction<string[]>>,
    foodSelected: React.RefObject<boolean>
  ) => {
    if (!query.trim() || foodSelected.current) {
      setSuggestions([]);
      foodSelected.current = false; // Reseta após uma seleção
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/sugestoes?query=${encodeURIComponent(query)}`);
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
    foodSelected.current = true; // Impede a reativação da busca imediatamente
  };

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
        `http://localhost:5000/api/equivalencia?baseFood=${encodeURIComponent(baseFood)}&baseQuantity=${encodeURIComponent(baseQuantity)}&substituteFood=${encodeURIComponent(substituteFood)}`
      );
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
          onChange={(e) => setBaseFood(e.target.value)}
          style={styles.input}
        />
        {baseSuggestions.length > 0 && (
          <ul style={styles.suggestionsList}>
            {baseSuggestions.map((food, index) => (
              <li key={index} onClick={() => handleSelectSuggestion(food, setBaseFood, setBaseSuggestions, baseFoodSelected)} style={styles.suggestionItem}>
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
              <li key={index} onClick={() => handleSelectSuggestion(food, setSubstituteFood, setSubstituteSuggestions, substituteFoodSelected)} style={styles.suggestionItem}>
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
    </div>
  );
}

const styles = {
  container: { 
    textAlign: "center" as "center", // Corrigir aqui, adicionando a tipagem explícita
    padding: "20px", 
    fontFamily: "Poppins, sans-serif" 
  },
  title: { marginBottom: "20px", color: "#04451c" },
  inputContainer: { marginBottom: "20px", position: "relative" },
  input: { padding: "12px", borderRadius: "15px", border: "2px solid #094e22", width: "80%", fontSize: "16px", marginBottom: "10px", outline: "none" },
  suggestionsList: { listStyle: "none", padding: 0, margin: 0, background: "#fff", border: "1px solid #ccc", borderRadius: "5px", position: "absolute", width: "80%", maxHeight: "150px", overflowY: "auto", zIndex: 10 },
  suggestionItem: { padding: "10px", cursor: "pointer", borderBottom: "1px solid #ddd" },
  button: { backgroundColor: "#04451c", color: "white", border: "none", padding: "12px 20px", borderRadius: "25px", cursor: "pointer", fontSize: "16px", transition: "0.3s" },
  error: { color: "red", fontSize: "16px", marginTop: "15px" },
  warning: { color: "red", fontSize: "16px", marginTop: "15px", fontWeight: "bold" },
  result: { marginTop: "20px", fontSize: "18px", fontWeight: "bold", color: "#023013" },
};
