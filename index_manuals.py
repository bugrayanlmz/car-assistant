from dotenv import load_dotenv
import os
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore
from langchain_pinecone import PineconeEmbeddings


load_dotenv()

import warnings
warnings.filterwarnings("ignore")

DATA_DIR = "./manuals"
CHROMA_BASE = "./chroma_dbs"

def create_index():
    print(f"Scanning manual directory: {DATA_DIR}")
    if not os.path.exists(DATA_DIR):
        print(f"Error: Directory {DATA_DIR} not found.")
        return

    os.makedirs(CHROMA_BASE, exist_ok=True)
    
    print("Loading local Embedding Model all-MiniLM-L6-v2")
    embedding_model = PineconeEmbeddings(
    model="multilingual-e5-large",
    pinecone_api_key=os.getenv("PINECONE_API_KEY")
)

    pdfs = [f for f in os.listdir(DATA_DIR) if f.endswith(".pdf")]
    
    if not pdfs:
        print("No PDFs found in the directory.")
        return

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ".", " ", ""]
    )

    for pdf in pdfs:
        vehicle_id = pdf.replace(".pdf", "")
            
        print(f"[START] Reading and splitting {pdf}...")
        pdf_path = os.path.join(DATA_DIR, pdf)
        loader = PyPDFLoader(pdf_path)
        pages = loader.load()
        chunks = text_splitter.split_documents(pages)
        
        print(f"[INDEXING] Writing {pdf} ({len(chunks)} chunks) to database...")
        PineconeVectorStore.from_documents(
    documents=chunks,
    embedding=embedding_model,
    index_name=os.getenv("PINECONE_INDEX_NAME"),
    namespace=vehicle_id
)
        print(f"[COMPLETED] {vehicle_id} is ready!\n")
        
    print("ALL TASKS FINISHED. Your databases are ready.")

if __name__ == "__main__":
    create_index()
