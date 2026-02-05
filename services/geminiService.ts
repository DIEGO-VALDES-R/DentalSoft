import { GoogleGenAI, Type } from "@google/genai";
import { ClinicalEntry, Patient } from "../types";

// NOTE: In a real production app, API calls should go through a backend (Laravel) 
// to protect the API key. For this frontend demo, we assume the env var is present.

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateClinicalSummary = async (patient: Patient, records: ClinicalEntry[]) => {
  try {
    const historyText = records.map(r => 
      `- Fecha: ${r.date}. Procedimiento: ${r.procedure}. Notas: ${r.notes}`
    ).join('\n');

    const prompt = `
      Actúa como un asistente clínico odontológico experto.
      Analiza el siguiente historial del paciente ${patient.name} (Edad: ${new Date().getFullYear() - new Date(patient.birthDate).getFullYear()} años).
      
      Historial Médico: ${patient.medicalHistory.join(', ') || 'Ninguno'}
      Alergias: ${patient.allergies.join(', ') || 'Ninguna'}

      Registros Clínicos Recientes:
      ${historyText}

      Proporciona un resumen conciso de 3 puntos clave sobre el estado del paciente y una recomendación para la próxima cita.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resumen: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 3 puntos clave sobre el estado del paciente"
            },
            recomendacion: {
              type: Type.STRING,
              description: "Recomendación para la próxima cita"
            }
          },
          propertyOrdering: ["resumen", "recomendacion"]
        }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return JSON.stringify({ error: "No se pudo generar el resumen." });
  }
};