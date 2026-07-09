// src/lib/classifier.ts
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_TOKEN);

/**
 * Maps the GoEmotions labels from the SamLowe/roberta-base-go_emotions model
 * to the 7 mental health categories defined in the implementation guide.
 *
 * The Elite13/bert-finetuned-mental-health model has no inference provider on
 * Hugging Face, so we use roberta-base-go_emotions and map its fine-grained
 * emotion labels into the project's target categories.
 */
const LABEL_MAP: Record<string, string> = {
  // → Normal
  neutral: 'Normal',
  approval: 'Normal',
  admiration: 'Normal',
  amusement: 'Normal',
  joy: 'Normal',
  love: 'Normal',
  optimism: 'Normal',
  pride: 'Normal',
  relief: 'Normal',
  gratitude: 'Normal',
  excitement: 'Normal',
  curiosity: 'Normal',
  surprise: 'Normal',
  realization: 'Normal',
  desire: 'Normal',

  // → Anxiety
  nervousness: 'Anxiety',
  fear: 'Anxiety',

  // → Depression
  sadness: 'Depression',
  grief: 'Depression',
  disappointment: 'Depression',
  remorse: 'Depression',

  // → Stress
  annoyance: 'Stress',
  anger: 'Stress',
  frustration: 'Stress',  // custom addition if present
  caring: 'Stress',

  // → Bipolar (mapped from rapid mood signals)
  confusion: 'Bipolar',

  // → Personality Disorder (mapped from interpersonal signals)
  embarrassment: 'Personality Disorder',
  disapproval: 'Personality Disorder',
  disgust: 'Personality Disorder',
};

const SUICIDAL_KEYWORDS = [
  "kill myself", "suicide", "end my life", "want to die", "ending my life",
  "self harm", "self-harm", "commit suicide", "take my own life", "wanna die",
  "better off dead", "dont want to live", "don't want to live", "end it all",
  "harm myself", "cutting myself", "suicidal"
];

function checkSuicidalKeywords(text: string): boolean {
  const normalized = text.toLowerCase().replace(/['’]/g, '');
  return SUICIDAL_KEYWORDS.some(keyword => {
    const normalizedKeyword = keyword.replace(/['’]/g, '');
    return normalized.includes(normalizedKeyword);
  });
}

function mapLabel(rawLabel: string): string {
  return LABEL_MAP[rawLabel.toLowerCase()] ?? 'Normal';
}

export async function classifySentiment(text: string): Promise<{
  label: string;
  score: number;
}> {
  if (checkSuicidalKeywords(text)) {
    return {
      label: 'Suicidal',
      score: 0.98,
    };
  }

  const result = await hf.textClassification({
    model: "SamLowe/roberta-base-go_emotions",
    inputs: text,
  });

  const topResult = result[0];

  return {
    label: mapLabel(topResult.label),
    score: topResult.score,
  };
}
