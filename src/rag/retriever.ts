import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();
export async function createRetriever() : Promise<VectorStoreRetriever> {
    const embeddingsLLM = new GoogleGenerativeAIEmbeddings({
        model: "gemini-embedding-001"
    });

    // const embedding = await embeddingsLLM.embedQuery("Hello world");
    // console.log(embedding.length);

    const pinecone = new Pinecone();


    const pineconeIndex = pinecone.index('index-3072');

    const vectorStore = await PineconeStore.fromExistingIndex(embeddingsLLM, {
        pineconeIndex,
    });

    return vectorStore.asRetriever();
}

// const retriever = await createRetriever();
// const context  = await retriever.invoke("What is langchain?");
// console.log(context);