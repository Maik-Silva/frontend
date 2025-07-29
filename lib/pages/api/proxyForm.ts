// pages/api/proxyForm.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { alimento } = req.body;

    // URL do formulário do Google Forms
    const formUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLSfDi33Amzo6L_j7X_YCSuEhZJxZohNazm3e7rDYX23Mm7kLnA/formResponse";

    // Campo do formulário (ajuste se necessário)
    const formData = new URLSearchParams();
    formData.append("entry.1297131437", alimento);

    const response = await fetch(formUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Erro ao enviar para Google Forms" });
    }

    return res.status(200).json({ message: "Sugestão enviada com sucesso" });
  } catch (error) {
    console.error("Erro ao enviar sugestão:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
