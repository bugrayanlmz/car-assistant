# AutoHelper Car Assistant

A web application for asking questions about vehicle manuals. It retrieves relevant PDF passages from Pinecone and uses Gemini to generate streamed answers with source filenames and page references.

## Tech Stack

React 19, Vite, and React Markdown on the frontend; Python, FastAPI, LangChain, Gemini, and Pinecone on the backend.

## Setup

Requires Python, Node.js 22.12 or later, a Gemini API key, and a Pinecone account with an index compatible with `multilingual-e5-large` embeddings.

```bash
git clone https://github.com/bugrayanlmz/car-assistant.git
cd car-assistant
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

The activation command above is for macOS/Linux. Create a root `.env` file:

```env
GOOGLE_API_KEY=your-google-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=your-index-name
```

## Prepare Manuals

Place PDFs in `manuals/` and register vehicles in [vehicles.json](vehicles.json). Each vehicle ID must match its PDF filename without the extension, such as `BMW_M3_2025.pdf`. Manuals are not included.

[index_manuals.py](index_manuals.py) splits PDFs and uploads embeddings to a Pinecone namespace per vehicle. The script currently references an undefined `CHROMA_BASE`; remove or correct that leftover `os.makedirs(CHROMA_BASE, exist_ok=True)` line before running:

```bash
python index_manuals.py
```

## Run Locally

From the repository root, start the API:

```bash
uvicorn api:app --reload --port 8000
```

In a second terminal, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, select an indexed vehicle, and ask a question. The frontend defaults to `http://localhost:8000`; set `VITE_API_BASE_URL` in `frontend/.env` to use another API address.

Run `npm run build` inside `frontend/` to generate `frontend/dist/`. Vehicle selection is currently shared across backend users.
