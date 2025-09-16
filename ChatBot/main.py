from contextlib import asynccontextmanager
import asyncio
import logging
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from chatbot_response import get_chatbot_response  # your logic


# Optional: structured logging via Uvicorn's logger
logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Example: pre-load ML models, warm caches, open DB connections
    # This runs before the app starts accepting requests and cleans up on shutdown
    # Use app.state to store global resources if needed, e.g. app.state.model = ...
    try:
        yield
    finally:
        # Example: release resources, close connections
        pass


app = FastAPI(
    title="Medical Chatbot API",
    lifespan=lifespan,
)


# CORS configuration (adjust origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # replace with explicit origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class Message(BaseModel):
    # Enforce minimal and maximal length, and reject overly large payloads
    text: str = Field(..., min_length=1, max_length=4000)


class ChatResponse(BaseModel):
    reply: str


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {"Chatbot": "Hello! I'm your medical assistant. Ask anything."}


async def _call_chatbot(text: str) -> str:
    """
    If get_chatbot_response is async, await it; otherwise run in a threadpool
    so the event loop isn't blocked by CPU/IO-bound work.
    """
    if asyncio.iscoroutinefunction(get_chatbot_response):
        return await get_chatbot_response(text)
    return await run_in_threadpool(get_chatbot_response, text)


@app.post("/assistance", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat(msg: Message) -> ChatResponse:
    cleaned = msg.text.strip()
    if not cleaned:
        raise HTTPException(status_code=422, detail="text must not be empty or whitespace")

    try:
        reply = await _call_chatbot(cleaned)
        return ChatResponse(reply=reply)
    except Exception as exc:
        logger.exception("chatbot error")
        # Hide internal details from clients
        raise HTTPException(status_code=500, detail="internal error") from exc




# class Question(BaseModel):
#     question: str

# def detect_language(text: str) -> str:
#     for ch in text:
#         if "\u0C00" <= ch <= "\u0C7F":   # Telugu Unicode range
#             return "te"
#     return "en"

# @app.post("/chat/voice")
# def ask_question(payload: Question):
#     try:
#         # Auto-detect lang from question
#         lang = detect_language(payload.question)
#         answer = process_question(payload.question, lang)
#         return JSONResponse(content={
#             "question": payload.question,
#             "lang_detected": lang,
#             "answer": answer
#         })
#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)
