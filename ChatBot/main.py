from fastapi import FastAPI, Form
from pydantic import BaseModel
from chatbot_response import get_chatbot_response   # import your logic
# from front_integration import process_question 
# from fastapi.responses import JSONResponse
app = FastAPI(title="Medical Chatbot API")

# Define request body
class Message(BaseModel):
    text: str
@app.get("/")
async def root():
    return {"Chatbot": "Hello! I'm your medical assistant. Ask me anything."}

# Define API endpoint
@app.post("/assistance")
async def chat(msg: Message):
    reply = get_chatbot_response(msg.text)
    return {"reply": reply}



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
