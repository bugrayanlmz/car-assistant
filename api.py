import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_pinecone import PineconeVectorStore
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.output_parsers import StrOutputParser
    from langchain_core.runnables import RunnablePassthrough
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import StreamingResponse
    from pydantic import BaseModel
    from langchain_pinecone import PineconeEmbeddings
    import json
except ImportError as e:
    raise RuntimeError(f"Missing dependency: {e}")


GOOGLE_API_KEY  = os.getenv("GOOGLE_API_KEY", "")
LLM_MODEL       = "gemini-2.5-flash"
CHROMA_BASE     = "./chroma_dbs"



app = FastAPI(title="autohelper Vehicle Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



embedding_model   = None
active_vehicle_id = None
chain_instance    = None



SYSTEM_PROMPT = """
You are an expert vehicle manual assistant and mechanic. Based on the selected vehicle's official manual,
you answer drivers' queries. Use ONLY the context provided below to answer.

Rules:
- Respond in the same language as the user's question (e.g., if English, respond in English; if Turkish, respond in Turkish).
- If the answer is not in the context, say (in the user's language): "This information is not available in the current manual, please contact a service center."
- Explain technical terms simply.
- Give short, clear, and step-by-step answers.
- Do not go off-topic, only answer vehicle-related questions.

Context:
{context}
"""

PROMPT_TEMPLATE = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human", "{input}"),
])



def _get_embedding():
    global embedding_model
    if embedding_model is None:
        print("Loading local embedding model...")
        embedding_model = PineconeEmbeddings(
    model="multilingual-e5-large",
    pinecone_api_key=os.getenv("PINECONE_API_KEY")
)
    return embedding_model

def _get_vehicle_list():
    try:
        with open("vehicles.json", "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Araç listesi okuma hatası: {e}")
        return []

def _build_chain(vehicle_id: str):

    db = PineconeVectorStore.from_existing_index(
    index_name=os.getenv("PINECONE_INDEX_NAME"),
    embedding=_get_embedding(),
    namespace=vehicle_id
)
    retriever = db.as_retriever(search_kwargs={"k": 4})
    llm = ChatGoogleGenerativeAI(
        model=LLM_MODEL,
        google_api_key=GOOGLE_API_KEY,
        temperature=0.2,
    )

    generation_chain = PROMPT_TEMPLATE | llm | StrOutputParser()
    return {"chain": generation_chain, "retriever": retriever}


@app.get("/vehicles")
def get_vehicles():
    return {"vehicles": _get_vehicle_list()}

@app.get("/status")
def status():
    return {
        "active": True,
        "active_vehicle": active_vehicle_id,
        "ready": chain_instance is not None,
        "total_vehicles": len(_get_vehicle_list()),
    }

class SelectVehicleRequest(BaseModel):
    vehicle_id: str

@app.post("/select_vehicle")
def select_vehicle(data: SelectVehicleRequest):
    global active_vehicle_id, chain_instance
    try:
        chain_instance = _build_chain(data.vehicle_id)
        active_vehicle_id = data.vehicle_id
        return {"message": f"{data.vehicle_id} loaded successfully.", "vehicle_id": active_vehicle_id}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Index not found for this vehicle.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AskRequest(BaseModel):
    question: str

@app.post("/ask")
async def ask(data: AskRequest):
    if not chain_instance:
        raise HTTPException(status_code=400, detail="Please select a vehicle first.")
    
    chain = chain_instance["chain"]
    retriever = chain_instance["retriever"]

    async def generate_sse():
        try:
            docs = await retriever.ainvoke(data.question)
            
            sources = [
                {
                    "file": Path(d.metadata.get("source", "?")).name,
                    "page": d.metadata.get("page", 0) + 1 if isinstance(d.metadata.get("page"), int) else "?"
                }
                for d in docs
            ]
            yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"

            formatted_docs = "\n\n".join(d.page_content for d in docs)
            
            async for chunk in chain.astream({"input": data.question, "context": formatted_docs}):
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
                
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(generate_sse(), media_type="text/event-stream")