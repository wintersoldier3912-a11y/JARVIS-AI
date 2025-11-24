import { GoogleGenAI, GenerateContentResponse, FunctionDeclaration, Type } from "@google/genai";
import { DomainModule, ExecutionResult, SubModelCall } from '../types';

// Access environment variable safely handling both Vite and standard environments
let apiKey = "";
try {
  // Safely check for Vite environment
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_KEY) {
    apiKey = (import.meta as any).env.VITE_API_KEY;
  } 
  // Fallback to process.env (standard Node/Webpack or System Injection)
  else if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    apiKey = process.env.API_KEY;
  }
} catch (e) {
  console.warn("Error retrieving API Key:", e);
}

const ai = new GoogleGenAI({ apiKey });

// --- TOOL DEFINITIONS ---

const controlDeviceTool: FunctionDeclaration = {
  name: 'control_home_device',
  description: 'Turn a smart home device on or off, or adjust settings. Use this when the user asks to change the state of lights, locks, or thermostats.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      device: { type: Type.STRING, description: 'The device name (e.g., lights, thermostat, door_lock)' },
      location: { type: Type.STRING, description: 'The room or location (e.g., living_room, lab, garage)' },
      action: { type: Type.STRING, description: 'turn_on, turn_off, set_level, lock, unlock' },
      value: { type: Type.STRING, description: 'Optional value for levels (e.g., 50, 72)' }
    },
    required: ['device', 'action']
  }
};

const computerControlTool: FunctionDeclaration = {
  name: 'computer_automation',
  description: 'Perform system-level computer tasks like opening applications, websites, generic web searches, or basic file operations.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, description: 'Action type: open_website, search_web' },
      target: { type: Type.STRING, description: 'Target application, URL, or search query.' }
    },
    required: ['action', 'target']
  }
};

const communicationTool: FunctionDeclaration = {
  name: 'communication_tool',
  description: 'Send emails or messages to contacts.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, description: 'email' },
      recipient: { type: Type.STRING, description: 'Email address or name of the contact' },
      subject: { type: Type.STRING, description: 'Subject of the email' },
      body: { type: Type.STRING, description: 'Body content of the email' }
    },
    required: ['type', 'recipient']
  }
};

const documentCreationTool: FunctionDeclaration = {
  name: 'document_creation',
  description: 'Initialize complex document creation tasks for reports, research papers, coding projects, or presentations.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      docType: { type: Type.STRING, description: 'report, research_paper, code_project, presentation, spreadsheet, document' },
      topic: { type: Type.STRING, description: 'The topic or title of the document/project' },
      platform: { type: Type.STRING, description: 'Optional: github, codesandbox, google_docs, google_slides, arxiv (for search)' }
    },
    required: ['docType', 'topic']
  }
};

// --- SYSTEM INSTRUCTIONS ---

const SUB_MODEL_REGISTRY = `
AVAILABLE SUB-MODELS (APIs):
1. [3D_DESIGN_ENGINE] Params: { geometryType: string, polyCount: string, renderStyle: string }
2. [TACTICAL_OPS_V4] Params: { scenario: string, threatLevel: string, logistics: boolean }
3. [QUANTUM_SIMULATOR] Params: { particleType: string, coherenceTime: number, algorithm: string }
4. [BIO_GENESIS_DB] Params: { organism: string, geneticMarkers: string[], analysisType: string }
5. [CODE_ARCHITECT] Params: { language: string, framework: string, pattern: string }
6. [GLOBAL_INTEL] Params: { region: string, economicIndicators: string[], historicalContext: boolean }
7. [VISION_CORE] Params: { objectDetection: boolean, faceRecognition: boolean, sceneAnalysis: boolean }
8. [IOT_MASTER_CONTROL] Params: { protocol: string, deviceId: string, command: string }
9. [AR_VR_COMPOSER] Params: { environment: string, objects: string[], physics: boolean, platform: 'WebXR' | 'Unity' | 'Unreal' }
`;

const getSystemInstruction = (domain: DomainModule): string => {
  return `
    You are J.A.R.V.I.S. (Just A Rather Very Intelligent System).
    Current Domain: ${domain}

    LINGUISTIC CAPABILITIES:
    - You are a polyglot system fluent in English, Hindi, Tamil, Bengali, Telugu, Marathi, Japanese, French, German, Korean, Chinese, and Russian.
    - RESPOND in the SAME language as the input.

    CORE WORKFLOW:
    1. ANALYZE: Scan input for intent (coding, research, automation, etc).
    2. ARCHITECT: Select Tools.
    3. EXECUTE: Trigger the tool or generate the response.

    TOOL USAGE GUIDELINES:
    
    1. **COMPUTER/WEB AUTOMATION** ('computer_automation'):
       - Use for general web searches (Google), opening websites (YouTube, Netflix), or simple navigation.
       - Example: "Open YouTube", "Search for Iron Man".

    2. **COMMUNICATION** ('communication_tool'):
       - Use when the user wants to SEND an email.
       - Extract recipient, subject, and body. If body is missing, ask for it or generate a professional draft.

    3. **DOCUMENT & PROJECT CREATION** ('document_creation'):
       - **Coding Projects**: If user says "Build a React app" or "Start a Python project", use docType: 'code_project'.
       - **Research/Reports**: If user says "Prepare a report on..." or "Write a research paper on...", use docType: 'research_paper' or 'report'.
       - **Presentations**: If user says "Make a PPT", use docType: 'presentation'.
       - **Document Search**: If user says "Find documents/papers on...", use docType: 'research_paper' with platform 'arxiv' or 'google_scholar'.

    4. **IOT CONTROL** ('control_home_device'):
       - Lights, locks, thermostats.

    ${SUB_MODEL_REGISTRY}

    RESPONSE FORMAT:
    Output strict XML-like format.
    
    <analysis>Brief technical analysis.</analysis>
    <architecture>JSON Array of sub-model calls.</architecture>
    <knowledge_graph>JSON Object with 'nodes' and 'edges'.</knowledge_graph>
    <execution>
    Final conversational response.
    If you are generating CODE for a project, include it here in Markdown code blocks.
    If you are writing a REPORT, include the summary here.
    </execution>
  `;
};

export const sendMessageToGemini = async (
  message: string,
  domain: DomainModule,
  imageBase64: string | null = null,
  useRealTime: boolean = false
): Promise<ExecutionResult & { sources?: any[] }> => {
  try {
    const modelId = useRealTime ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
    
    const config: any = {
      systemInstruction: getSystemInstruction(domain),
      temperature: 0.7,
      tools: [
        { functionDeclarations: [controlDeviceTool, computerControlTool, communicationTool, documentCreationTool] },
        useRealTime ? { googleSearch: {} } : undefined
      ].filter(Boolean) as any
    };

    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64
        }
      });
    }
    parts.push({ text: message });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: config
    });

    const fullText = response.text || "";
    
    // Capture Function Calls
    let functionCalls: Array<{name: string, args: any}> = [];
    let functionOutput = "";

    if (response.functionCalls && response.functionCalls.length > 0) {
       response.functionCalls.forEach(fc => {
          functionCalls.push({ name: fc.name, args: fc.args });
          
          if (fc.name === 'control_home_device') {
             functionOutput += `\n[IOT PROTOCOL]: Device: ${fc.args.device} | Action: ${fc.args.action}`;
          } else if (fc.name === 'computer_automation') {
             functionOutput += `\n[SYSTEM]: ${fc.args.action} -> ${fc.args.target}`;
          } else if (fc.name === 'communication_tool') {
             functionOutput += `\n[COMM_LINK]: Sending Email to ${fc.args.recipient}`;
          } else if (fc.name === 'document_creation') {
             functionOutput += `\n[FABRICATION]: Creating ${fc.args.docType} about ${fc.args.topic}`;
          }
       });
    }

    // Parse Response
    const analysisMatch = fullText.match(/<analysis>([\s\S]*?)<\/analysis>/);
    const architectureMatch = fullText.match(/<architecture>([\s\S]*?)<\/architecture>/);
    const knowledgeMatch = fullText.match(/<knowledge_graph>([\s\S]*?)<\/knowledge_graph>/);
    const executionMatch = fullText.match(/<execution>([\s\S]*?)<\/execution>/);

    let architecture: SubModelCall[] = [];
    let knowledgeGraph = { nodes: [], edges: [] };

    try {
      if (architectureMatch) {
        const parsed = JSON.parse(architectureMatch[1]);
        if (Array.isArray(parsed)) {
          architecture = parsed.map((item: any) => ({
             ...item,
             parameters: item.parameters || {} 
          }));
        }
      }
      if (knowledgeMatch) knowledgeGraph = JSON.parse(knowledgeMatch[1]);
    } catch (e) {
      console.warn("Failed to parse JSON blocks");
    }

    let executionText = executionMatch ? executionMatch[1].trim() : fullText;
    if (functionOutput) executionText += `\n\n\`\`\`bash${functionOutput}\n\`\`\``;

    // Grounding
    let sources = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      sources = response.candidates[0].groundingMetadata.groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web !== undefined);
    }

    return { 
      analysis: analysisMatch ? analysisMatch[1].trim() : (imageBase64 ? "Visual Analysis Active..." : "Processing intent..."),
      architecture,
      response: executionText,
      knowledgeGraph,
      sources,
      functionCalls
    };

  } catch (error: any) {
    console.error("Gemini Protocol Error:", error);
    return { 
      analysis: "PROTOCOL FAILURE",
      architecture: [],
      response: `System Malfunction: ${error.message}. Rebooting modules...`, 
      knowledgeGraph: { nodes: [], edges: [] },
      sources: [] 
    };
  }
};