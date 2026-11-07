import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {ChatOpenAI} from "@langchain/openai";
import { createRetriever } from "./retriever";
import {RunnableSequence} from "@langchain/core/runnables"
import {formatDocumentsAsString} from "@langchain/classic/util/document";
import { chat, ChatHandler } from "../utils/chat";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";


// 1. Better prompt
const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `You are an expert technical documentation assistant.

Your task is to answer questions using the provided documentation context.

Instructions:
- Give detailed and informative answers.
- Explain concepts step by step when necessary.
- Include relevant examples when available in the context.
- Do not unnecessarily shorten your answers.
- Use bullet points and code examples where appropriate.
- If the answer is not available in the context, clearly say that you don't know.
- Do not make up information.

Provide a clear and helpful answer.`
    ],
    [
        "human",
        `Question: {question}

Documentation Context:
{context}

Answer:`
    ]
]);


// const llm = new ChatOpenAI({
//     model: "gemini-pro-13b",
//     temperature: 0.2,
//     maxTokens: 512
// });

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-3.5-flash",
    // temperature: 0.2,
    // maxOutputTokens: 512,
});

const outputParser = new StringOutputParser();

const retriever = await createRetriever();

const retiverChain = RunnableSequence.from([
    (input) => input.question,
    retriever,
    formatDocumentsAsString
]);

const generativeChain = RunnableSequence.from([
    {
        question: (input) => input.question,
        context: retiverChain
    },
    prompt, 
    llm, 
    outputParser
]);

const chatHandler: ChatHandler = async (question: string) => {
    return {
        answer: generativeChain.invoke({ question })
    };
}

chat(chatHandler);