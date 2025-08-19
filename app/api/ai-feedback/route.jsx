import OpenAI from "openai";
import { FEEDBACK_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { conversation } = await req.json();
    console.log(typeof conversation);
    const FINAL_PROMPT = FEEDBACK_PROMPT.replace("{{conversation}}", JSON.stringify(conversation));
   
    try {
        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
        })
        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-r1:free",
            messages: [
                { role: "user", content: FINAL_PROMPT }
            ],
            // responseformat: 'json'
        })
        console.log(completion?.choices[0]?.message)
        return NextResponse.json(completion?.choices[0]?.message)
    } catch (e) {
        console.error(e);
        return NextResponse.json(e);
    }
}