import { Document } from "@langchain/core/documents";
import { crawlLangchainDocsUrls } from "./crawlDocuments";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import cliProgress from "cli-progress";

const progressBar = new cliProgress.SingleBar({})
export async function loadDocuments() : Promise<Document[]> {
    const langChainDocsUrls = await crawlLangchainDocsUrls();
    const rawDocuments: Document[] = [];

    console.log(`starting document download. ${langChainDocsUrls.length} total documents`);

    progressBar.start(langChainDocsUrls.length, 0);
    for(const url of langChainDocsUrls) {
        const loader = new CheerioWebBaseLoader(url);
        const docs = await loader.load();
        rawDocuments.push(...docs); 
        progressBar.increment();
    }
    progressBar.stop();
    console.log(rawDocuments.length + " Document loaded");
    return rawDocuments;
}

// const rawDocuments = await loadDocuments();
// console.log(rawDocuments.slice(0, 4));