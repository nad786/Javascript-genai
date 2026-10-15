import {PromptTemplate} from "@langchain/core/prompts"
import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import {ChatGoogleGenerativeAI} from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { LLMChain } from "@langchain/classic/chains";
import {RunnableSequence} from "@langchain/core/runnables"

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

//    const lcelChain =  promptTemplate.pipe(llm).pipe(outputParser);
//    const res = await lcelChain.invoke({
//     course, role, wordlimit
//    });

//    console.log('Lcel Chain', res);

const lcelChain = RunnableSequence.from([
    promptTemplate, llm , outputParser
])

const ans = await lcelChain.invoke({
           course, role, wordlimit
        })

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