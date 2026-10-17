import { Document } from "@langchain/core/documents";
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters"
import { loadDocuments } from "./loadDocuments";

export async function splitDocuments(rawDocuments: Document[]) : Promise<Document[]> {
    const splitter = RecursiveCharacterTextSplitter.fromLanguage('html', {
        chunkSize: 500,
        chunkOverlap: 100
    });

    const documentsChunks = await splitter.splitDocuments(rawDocuments);
    console.log(`${rawDocuments.length} docuemnts split into ${documentsChunks.length}`);
    return documentsChunks;
}

// const rawDocuments = await loadDocuments();
// const documentsChunks = await splitDocuments(rawDocuments);
// console.log(documentsChunks.length);