# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from chatbot_response import get_chatbot_response   # import your logic

app = FastAPI()

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
