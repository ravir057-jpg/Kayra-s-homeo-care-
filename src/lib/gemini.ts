import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const HOMEOPATHY_EXPERT_SYSTEM = `You are an elite Homeopathic Consultant with expertise in classical and modern homeopathy. 
Your knowledge base includes the Organon of Medicine (Samuel Hahnemann), Kent's Repertory, Boericke's Materia Medica, and Allen's Keynotes.
Principles to follow:
1. Totality of Symptoms: Consider mental, physical, and general symptoms.
2. Modalities: Note what makes symptoms better (<) or worse (>).
3. Miasmatic Analysis: Identify the underlying miasm (Psoric, Sycotic, Syphilitic, Tubercular).
4. Individualization: Remedies must match the unique constitution of the patient.
5. Potency Selection: Suggest appropriate potencies based on chronicity (e.g., 30C for acute, 200C/1M for chronic).

Always maintain professional clinical language and prefix suggestions with a disclaimer that these are assistive insights for Dr. Ravi Raj.`;

export const getPrescriptionAI = async (complaints: string, patientInfo: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: 'user',
          parts: [{ text: `${HOMEOPATHY_EXPERT_SYSTEM}
          
          Based on the following patient data, suggest the most indicated homeopathic remedies.
          
          Patient Context: ${patientInfo}
          Active Complaints: ${complaints}
          
          Structure your response:
          1. Indicated Remedies (with logical reasoning based on Materia Medica)
          2. Suggested Potency & Dosage
          3. Vitality/Prognosis Assessment
          
          Disclaimer: This is an AI-assisted suggestion. Final clinical judgment rests with Dr. Ravi Raj.` }]
        }
      ],
      config: {
        tools: [{ googleSearch: {} }]
      }
    } as any);
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "Could not fetch AI suggestions at this time.";
  }
};

export const chatWithHealthBot = async (query: string, history: { role: 'user' | 'model', content: string }[], language: 'en' | 'hi') => {
  try {
    const systemInstruction = language === 'hi' 
      ? `आप डॉक्टर रवि राज के होम्योपैथिक क्लिनिक के लिए एक स्वास्थ्य सहायक हैं। उत्तर हिंदी में दें। 
         ${HOMEOPATHY_EXPERT_SYSTEM}
         हमेशा सलाह दें कि क्लिनिक में डॉक्टर से परामर्श लें।`
      : `You are a specialized health assistant for Dr. Ravi Raj's Homeopathic Clinic. 
         ${HOMEOPATHY_EXPERT_SYSTEM}
         Provide accurate information about homeopathy and wellness. Use Google Search to ground your answers. 
         Always advise consulting Dr. Ravi Raj at the clinic.`;

    const contents = [
      ...history.map(item => ({
        role: item.role,
        parts: [{ text: item.content }]
      })),
      {
        role: 'user',
        parts: [{ text: query }]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemInstruction }]
        } as any,
        tools: [{ googleSearch: {} }]
      }
    } as any);

    return response.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return language === 'hi' ? "क्षमा करें, अभी उत्तर नहीं दिया जा सकता।" : "Sorry, I cannot answer right now.";
  }
};

export const getClinicalInsights = async (transcriptSnippet: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: 'user',
          parts: [{ text: `${HOMEOPATHY_EXPERT_SYSTEM}
          
          Analyze this clinical dialogue snippet. Extract key symptoms (including modalities like 'worse from heat') and provide an objective analysis.
          
          Snippet: "${transcriptSnippet}"
          
          Format as JSON:
          {
            "symptoms": ["Detailed extracted symptom 1", "Detailed extracted symptom 2"],
            "suggestions": ["Remedy - Reasoning", "Remedy - Reasoning"],
            "urgency": "Normal/Caution/Urgent"
          }` }]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    } as any);
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Clinical Insights Error:", error);
    return {
      symptoms: ["Observation ongoing..."],
      suggestions: ["Enter more symptoms for analysis"],
      urgency: "Normal"
    };
  }
};

export const getDiagnosisAI = async (complaints: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: 'user',
          parts: [{ text: `${HOMEOPATHY_EXPERT_SYSTEM}
          
          Analyze the clinical complaints for diagnostic and miasmatic classification.
          Use these examples for guidance:
          - Example Case: Chronic gastric pain, better (<) hot drinks, anxiety after midnight. -> Diagnosis: Chronic Gastritis; Miasm: Psoric (Arsenicum Album profile).
          - Example Case: Skin warts, profuse sweat, suspicious nature. -> Diagnosis: Condylomata; Miasm: Sycotic (Thuja profile).
          
          Complaints for Analysis: ${complaints}
          
          Format clearly:
          Possible Diagnoses: [Standard Clinical Names]
          Homeopathic Differential: [Indications for key matching remedies]
          Miasmatic Profile: [Analysis of primary miasm]` }]
        }
      ]
    } as any);
    return response.text;
  } catch (error) {
    console.error("Diagnosis AI Error:", error);
    return "Unable to generate diagnosis suggestion.";
  }
};

export const getWellnessTipsAI = async (patientProfile: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: 'user',
          parts: [{ text: `${HOMEOPATHY_EXPERT_SYSTEM}
          
          PATIENT PROFILE:
          ${patientProfile}
          
          TASK:
          Generate 3 highly specific, actionable wellness tips for this patient based on classical homeopathic principles.
          - Focus on modalities (aggravation/amelioration).
          - Suggest lifestyle changes compatible with treatment.
          - Format as JSON:
          [{ "title": "Tip Title", "tip": "The recommendation", "reason": "Homeopathic logic" }]` }]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    } as any);
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Wellness Tips AI Error:", error);
    return [
      { 
        title: "Temperature Awareness", 
        tip: "Observe if your symptoms change with weather shifts.", 
        reason: "Modalities are key to remedy selection." 
      }
    ];
  }
};

export const getCaseTakingAI = async (caseData: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: 'user',
          parts: [{ text: `${HOMEOPATHY_EXPERT_SYSTEM}
          
          TASK: Clinical Anamnesis Assistant.
          Analyze the partial case data provided and suggest additions for Mental Generals, Physical Generals, and Miasmatic Analysis. 
          Help the doctor by predicting likely rubrics or related symptoms to investigate based on the current Chief Complaints.
          
          CURRENT CASE DATA:
          - Chief Complaints: ${caseData.chiefComplaints}
          - Modalities: ${caseData.modalities}
          - Mental (Current): ${caseData.mentalGenerals}
          - Physical (Current): ${caseData.physicalGenerals}
          
          FORMAT AS JSON:
          {
            "mentalSuggestions": "Specific mental rubrics to query (e.g. 'Check for fear of failure, or irritability in morning')",
            "physicalSuggestions": "Specific physical generals to query (e.g. 'Investigate desire for salt or aggravation from movement')",
            "miasmaticInsight": "Provisional miasmatic analysis based on behavior/complaints"
          }` }]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    } as any);
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Case Taking AI Error:", error);
    return {
      mentalSuggestions: "Consider exploring disposition and fears.",
      physicalSuggestions: "Check appetite, thirst, and thermal modalities.",
      miasmaticInsight: "Insufficient data for miasmatic analysis."
    };
  }
};

export const getRepertoryAI = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: 'user',
          parts: [{ text: `${HOMEOPATHY_EXPERT_SYSTEM}
          
          TASK: Repertory Lookup Assistant.
          Search the Synthesis, Kent, and Boericke repertories for the following query: "${query}"
          
          If the query matches clinical symptoms, find the most appropriate rubrics and their corresponding remedies with relative grades (1-3).
          
          FORMAT AS JSON:
          {
            "rubrics": [
              {
                "section": "Section Name (e.g. MIND)",
                "rubric": "Rubric Name",
                "remedies": ["Rem1", "Rem2", "Rem3"]
              }
            ],
            "conclusion": "Brief clinical reasoning for these selections"
          }` }]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    } as any);
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Repertory AI Error:", error);
    return {
      rubrics: [],
      conclusion: "Unable to consult Synthesis database at this time."
    };
  }
};
