import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {ChatOpenAI} from "@langchain/openai";
import { createRetriever } from "./retriever";
import {RunnableSequence} from "@langchain/core/runnables"
import {formatDocumentsAsString} from "@langchain/classic/util/document";
import { chat, ChatHandler } from "../utils/chat";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";


const promt = ChatPromptTemplate.fromMessages([
    
    "Human",
    `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
    Question: {question} 
    Context: {context} 
    Answer:`
]);

// const llm = new ChatOpenAI({
//     model: "gemini-pro-13b",
//     temperature: 0.2,
//     maxTokens: 512
// });

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-3.5-flash",
    temperature: 0.2,
    maxOutputTokens: 512,
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
    promt, 
    llm, 
    outputParser
]);

const chatHandler: ChatHandler = async (question: string) => {
    return {
        answer: generativeChain.invoke({ question })
    };
}

chat(chatHandler);