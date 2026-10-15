import {PromptTemplate} from "@langchain/core/prompts"
import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import {ChatGoogleGenerativeAI} from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { LLMChain } from "@langchain/classic/chains";

dotenv.config();

async function personalisedPitch({ course, role, wordlimit }: { course: string, role: string, wordlimit: number }) {

    const promptTemplate = new PromptTemplate({
        template: "describe the importance of learning {course} for a {role}. Limit the outputs to {wordlimit} words.",
        inputVariables: ["course", "role", "wordlimit"]
    });;
    const formattedPromt = await promptTemplate.format({
        course,
        role,
        wordlimit
    });
    
    const llm = new ChatGoogleGenerativeAI({
        model: "gemini-3.8-flash"   // if this model is not available anymore then please check another available model from google gemini api documentation
    });
    const outputParser = new StringOutputParser();

    const legacyChain = new LLMChain({
        prompt: promptTemplate,
        llm,
        outputParser
    })

    const answer = await legacyChain.invoke({
        course, 
        role,
        wordlimit
    });
    console.log(answer)
}

personalisedPitch({
    course: 'Generative AI',
    role: 'Javascript developer',
    wordlimit: 100
})
personalisedPitch({
    course: 'AWS',
    role: 'Javascript developer',
    wordlimit: 100
})