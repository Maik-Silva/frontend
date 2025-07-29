// netlify/functions/proxyForm.js

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método não permitido" }),
    };
  }

  try {
    const { alimento } = JSON.parse(event.body);

    const formUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLSfDi33Amzo6L_j7X_YCSuEhZJxZohNazm3e7rDYX23Mm7kLnA/formResponse";

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
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Erro ao enviar para Google Forms" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Sugestão enviada com sucesso" }),
    };
  } catch (error) {
    console.error("Erro ao enviar sugestão:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro interno do servidor" }),
    };
  }
}
