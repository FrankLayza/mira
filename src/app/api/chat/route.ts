// src/app/api/chat/route.ts

import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { classifySentiment } from "@/lib/classifier";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { messages, latestMessage } = await req.json();

  // Step 1: Classify the sentiment of the student's latest message
  let label = "Normal";
  let score = 1.0;
  try {
    const classification = await classifySentiment(latestMessage);
    label = classification.label;
    score = classification.score;
  } catch (err) {
    console.error("Sentiment classification failed, using fallback 'Normal':", err);
  }

  // Step 2: Build a dynamic system prompt informed by the sentiment
  const systemPrompt = buildSystemPrompt(label, score);

  // Step 3: Prepare messages for Groq with full conversation history
  const groqMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages,
  ];

  try {
    // Step 4: Stream the LLM response
    const stream = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: groqMessages,
      stream: true,
      max_tokens: 512,
      temperature: 0.7,
    });

    // Step 5: Return a streaming response with sentiment metadata in the first chunk
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        // Send the sentiment metadata as a JSON line first
        const meta = JSON.stringify({ type: "sentiment", label, score }) + "\n";
        controller.enqueue(encoder.encode(meta));

        for await (const chunk of stream) {
          const token = chunk.choices[0]?.delta?.content || "";
          if (token) controller.enqueue(encoder.encode(token));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Groq generation error:", error);
    return new Response(
      JSON.stringify({
        error: "Mira is unavailable right now. Please try again in a moment.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

function buildSystemPrompt(label: string, score: number): string {
  const confidence = (score * 100).toFixed(1);

  const lines = [
    'You are Mira, a compassionate AI mental health companion for university students.',
    'The message has been classified as: ' + label + ' (confidence: ' + confidence + '%).',
    'Respond with warmth and empathy based on the classification.',
    'If Suicidal, provide crisis helpline info. For Anxiety/Depression, validate feelings.',
    'For Normal, respond naturally. Never diagnose. Never be dismissive.',
  ];

  return lines.join(' ');
}
