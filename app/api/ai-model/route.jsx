import { QUESTIONS_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";


export async function POST(req) {


    const {jobposition,jobdescription,duration,type}=await req.json();
    const FINAL_PROMPT=QUESTIONS_PROMPT
    .replace('{{jobTitle}}',jobposition)
    .replace('{{jobdescription}}',jobdescription)
    .replace('{{duration}}',duration)
    .replace('{{type}}',type)

    console.log(FINAL_PROMPT);


    try{
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
      })
      const completion = await openai.chat.completions.create({
        model: "deepseek/deepseek-r1:free",
        messages: [
          { role: "user", content: FINAL_PROMPT }
        ],
        responseformat:'json'
      })
      console.log(completion.choices[0].message)
      // Instead of returning completion.choices[0].message directly, wrap it in { content: ... }
      const message = completion.choices[0].message;
      let content = message?.content || message?.Content || message;
      return NextResponse.json({ content });
    }
    catch(e)
    {
        console.log(e)
        return NextResponse.json(e)
}
}