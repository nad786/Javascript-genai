import dotenv from "dotenv";
import { loadDocuments } from "./loadDocuments";
import { splitDocuments } from "./splitDocuments";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import cliProgress from "cli-progress";

dotenv.config();

const rawDocuments = await loadDocuments();

const documentsChunks = await splitDocuments(rawDocuments);

// const embeddingsLLM = new GoogleGenerativeAIEmbeddings({
//     model: "gemini-embedding-001", // If this model is not available anymore, then use another available embeddings model from google documentation
// });

const embeddingsLLM = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001"
});

const embedding = await embeddingsLLM.embedQuery("Hello world");
console.log(embedding.length);

const pinecone = new Pinecone();


// await pinecone.createIndex({
//     name: 'index-3072',
//     dimension: 3072, // Set dimension to 3072
//     metric: 'cosine',
//     spec: {
//         serverless: {
//             cloud: 'aws',
//             region: 'us-east-1',
//         },
//     },
// });

const pineconeIndex = pinecone.index('index-3072');
// const pineconeIndex = pinecone.index('langchain-docs-openai');

const progressBar = new cliProgress.SingleBar({})
progressBar.start(documentsChunks.length, 0);

for(let i = 0; i < documentsChunks.length; i = i +10) {
    const batch = documentsChunks.slice(i, i +10);
    await PineconeStore.fromDocuments(batch, embeddingsLLM, {
        pineconeIndex,
    
    })
    progressBar.increment(batch.length);
}

progressBar.stop();

console.log("Chunks documents loaded sucessfully")