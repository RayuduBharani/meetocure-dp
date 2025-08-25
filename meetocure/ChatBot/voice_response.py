import os
import uuid
import time
from dotenv import load_dotenv
from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain_together import ChatTogether
from langchain.chains.conversational_retrieval.base import ConversationalRetrievalChain
from langchain_community.vectorstores import Chroma
import speech_recognition as sr
from gtts import gTTS
from playsound import playsound  

load_dotenv()
TOGETHER_API_KEY = os.environ.get('TOGETHER_API_KEY')
document = PyMuPDFLoader(file_path=r"A-Z Family Medical Encyclopedia.pdf", mode='single')
docs = document.load()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=50
)
text_data = [doc.page_content for doc in docs]
texts = text_splitter.create_documents(text_data)

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
chroma_db_path = "chroma_db2"

vectorstore = Chroma.from_documents(
    texts,
    embeddings,
    persist_directory=chroma_db_path
)
vectorstore.persist()

retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

llm_model = ChatTogether(
    together_api_key=TOGETHER_API_KEY,
    model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
    max_tokens=500
)

message_history = ChatMessageHistory()
memory = ConversationBufferMemory(
    chat_memory=message_history,
    memory_key="chat_history",
    input_key="question",
    output_key="answer",
    return_messages=True,
    human_prefix="Human",
    ai_prefix="AI",
)

combine_docs_prompt = PromptTemplate.from_template("""
You are a knowledgeable AI assistant specializing in medical guidance.
You MUST always reply in **Telugu language** clearly and simply.

Previous conversation:
{chat_history}

Human question:
{question}

Context from documents:
{context}

Instructions:
- Answer fully in Telugu (short but complete, 3–4 lines).  
- Use simple and compassionate words.  
- Never stop mid-sentence.  
- Always end with: “మరిన్ని వివరాల కోసం దయచేసి డాక్టర్‌ను సంప్రదించండి.”  
""")

conversation_chain = ConversationalRetrievalChain.from_llm(
    llm=llm_model,
    retriever=retriever,
    memory=memory,
    verbose=False,
    return_source_documents=True,
    combine_docs_chain_kwargs={"prompt": combine_docs_prompt},
)

def listen_telugu():
    """Listen from microphone and recognize Telugu speech."""
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("\n మాట్లాడండి... (Speak in Telugu)")
        r.adjust_for_ambient_noise(source)
        audio = r.listen(source)
    try:
        text = r.recognize_google(audio, language="te-IN")
        print(" మీరు అడిగింది:", text)
        return text
    except:
        print("ఆడియో గుర్తించలేకపోయాను.")
        return None

def speak_telugu(text):
    """Convert Telugu text to speech, play synchronously, then auto-delete file."""
    tts = gTTS(text=text, lang="te")
    filename = f"response_{uuid.uuid4().hex}.mp3"
    tts.save(filename)
    playsound(filename)

    #Delete file after playback
    try:
        os.remove(filename)
    except:
        pass

# main
if __name__ == "__main__":
    print(" Telugu Medical Voice Assistant ప్రారంభమైంది...")
    print("Ctrl+C నొక్కి బయటకు వెళ్లండి.\n")

    while True:
        question = listen_telugu()
        if not question:
            continue

        response = conversation_chain.invoke({"question": question})
        answer = response['answer']

        print("\n సమాధానం:", answer)
        speak_telugu(answer)  # only after finishing, mic listens again
