import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";
import { JobData, ResumeData, RoadmapStep, ATSResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_PRO = "gemini-3-pro-preview";
const MODEL_FLASH = "gemini-3-flash-preview";
const MODEL_IMAGE = "gemini-2.5-flash-image";

export const NAVIGATE_APP_TOOL: FunctionDeclaration = {
  name: 'navigateApp',
  description: 'Navigates the user to different sections of the CareerOS application.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      targetView: { 
        type: Type.STRING, 
        enum: ['dashboard', 'resume', 'roadmap', 'ats', 'projects', 'interview', 'profile'],
        description: 'The view/tab to open.'
      }
    },
    required: ['targetView']
  }
};

export const SYNC_PROFILE_DATA_TOOL: FunctionDeclaration = {
  name: 'syncProfileData',
  description: 'Synchronizes user profile data from a provided LinkedIn or GitHub URL using search grounding.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      platform: { type: Type.STRING, enum: ['linkedin', 'github'] },
      url: { type: Type.STRING },
      name: { type: Type.STRING },
      summary: { type: Type.STRING },
      skills: { type: Type.ARRAY, items: { type: Type.STRING } },
      experience: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            company: { type: Type.STRING },
            role: { type: Type.STRING },
            location: { type: Type.STRING },
            date: { type: Type.STRING },
            bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      },
      projects: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            link: { type: Type.STRING },
            bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    },
    required: ['platform', 'url', 'name', 'skills']
  }
};

export const ANALYZE_JOB_TOOL: FunctionDeclaration = {
  name: 'analyzeJob',
  description: 'Analyzes job descriptions to extract structured data.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      company: { type: Type.STRING },
      location: { type: Type.STRING },
      roleSummary: { type: Type.STRING },
      requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
      preferredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
      tools: { type: Type.ARRAY, items: { type: Type.STRING } },
      experienceLevel: { type: Type.STRING },
      keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['title', 'company', 'requiredSkills', 'roleSummary', 'experienceLevel']
  }
};

export const GENERATE_RESUME_TOOL: FunctionDeclaration = {
  name: 'generateResume',
  description: 'MIMICRY ENGINE: Strictly use the reference resume as a template. Replace content with User Profile data. Phrasing must be ATS-optimized.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      personalInfo: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
          linkedin: { type: Type.STRING },
          github: { type: Type.STRING },
          website: { type: Type.STRING }
        },
        required: ['name', 'email', 'phone']
      },
      summary: { type: Type.STRING },
      skills: { type: Type.ARRAY, items: { type: Type.STRING } },
      latexCode: { type: Type.STRING },
      experience: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            company: { type: Type.STRING },
            role: { type: Type.STRING },
            location: { type: Type.STRING },
            date: { type: Type.STRING },
            bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      },
      education: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            institution: { type: Type.STRING },
            degree: { type: Type.STRING },
            location: { type: Type.STRING },
            date: { type: Type.STRING },
            grade: { type: Type.STRING }
          }
        }
      },
      projects: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            link: { type: Type.STRING },
            bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      },
      achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
      extra: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            details: { type: Type.STRING }
          }
        }
      },
      mimicScore: { type: Type.NUMBER }
    },
    required: ['personalInfo', 'summary', 'skills', 'latexCode', 'experience', 'education', 'mimicScore']
  }
};

export const GENERATE_ROADMAP_TOOL: FunctionDeclaration = {
  name: 'generateRoadmap',
  description: 'Creates a step-by-step learning roadmap. You MUST include recommended resources like YouTube playlists or specific professional courses for each module.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      steps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            topics: { type: Type.ARRAY, items: { type: Type.STRING } },
            timeline: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['pending', 'completed', 'in-progress'] }
          }
        }
      },
      recommendedResources: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            url: { type: Type.STRING },
            platform: { type: Type.STRING, enum: ['YouTube', 'Article', 'Course'] },
            description: { type: Type.STRING }
          }
        }
      }
    },
    required: ['steps', 'recommendedResources']
  }
};

export const CHECK_ATS_TOOL: FunctionDeclaration = {
  name: 'checkATS',
  description: 'Analyzes ATS score and suggests improvements.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER },
      matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
      missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
      suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['score', 'matchingSkills', 'missingSkills', 'suggestions']
  }
};

export const PREPARE_INTERVIEW_TOOL: FunctionDeclaration = {
  name: 'prepareInterview',
  description: 'Generates mock questions and prep assets.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            category: { type: Type.STRING },
            hint: { type: Type.STRING }
          }
        }
      },
      technicalTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
      resources: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            url: { type: Type.STRING },
            platform: { type: Type.STRING, enum: ['YouTube', 'Article', 'Course'] },
            description: { type: Type.STRING }
          }
        }
      }
    },
    required: ['questions', 'technicalTopics', 'resources']
  }
};

export const GENERATE_PROJECTS_PPT_TOOL: FunctionDeclaration = {
  name: 'generateProjectsPPT',
  description: 'Creates a visual slide presentation for projects or seminars.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      theme: { type: Type.STRING, enum: ['modern', 'dark', 'professional', 'creative'] },
      font: { type: Type.STRING, enum: ['sans', 'serif', 'mono'] },
      slides: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            header: { type: Type.STRING },
            content: { type: Type.ARRAY, items: { type: Type.STRING } },
            speakerNotes: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            imageType: { type: Type.STRING, enum: ['AI', 'BROWSER', 'NONE'] }
          },
          required: ['header', 'content', 'imageType']
        }
      }
    },
    required: ['title', 'theme', 'font', 'slides']
  }
};

export const TOOLS_LIST = [
  ANALYZE_JOB_TOOL, 
  GENERATE_RESUME_TOOL, 
  GENERATE_ROADMAP_TOOL, 
  CHECK_ATS_TOOL, 
  PREPARE_INTERVIEW_TOOL, 
  GENERATE_PROJECTS_PPT_TOOL, 
  NAVIGATE_APP_TOOL,
  SYNC_PROFILE_DATA_TOOL
];

export async function generateAIImage(prompt: string): Promise<string | undefined> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: [{ parts: [{ text: prompt }] }],
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  } catch (e) { console.error(e); }
  return undefined;
}

export async function processChat(
  input: string, 
  history: any[] = [], 
  fileData?: { data: string; mimeType: string },
  isFastRequest: boolean = false
): Promise<GenerateContentResponse> {
  const parts: any[] = [{ text: input }];
  if (fileData) parts.push({ inlineData: { data: fileData.data, mimeType: fileData.mimeType } });
  const modelToUse = isFastRequest ? MODEL_FLASH : MODEL_PRO;
  return await ai.models.generateContent({
    model: modelToUse,
    contents: [...history, { role: 'user', parts: parts }],
    config: {
      systemInstruction: `You are CareerOS. 
      CORE MISSION: Turn any job post into a tailored application.
      PROJECTS: The Projects section uses a PPT Generator to visualize ideas. When the user asks to generate a project or slide deck, use 'generateProjectsPPT'.
      ROADMAPS: You MUST include YouTube playlist links and specific course URLs in the recommendedResources field.
      VISUALS: Header in the Projects view must say 'PROJECTS'.`,
      tools: [{ functionDeclarations: TOOLS_LIST }, { googleSearch: {} }]
    }
  });
}

export function getGenAI() { return new GoogleGenAI({ apiKey: process.env.API_KEY }); }