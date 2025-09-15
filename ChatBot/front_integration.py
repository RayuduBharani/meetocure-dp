# import os
# import uuid
# from dotenv import load_dotenv
# from langchain_community.document_loaders import PyMuPDFLoader
# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain_huggingface import HuggingFaceEmbeddings
# from langchain_community.chat_message_histories import ChatMessageHistory
# from langchain.memory import ConversationBufferMemory
# from langchain.prompts import PromptTemplate
# from langchain_together import ChatTogether
# from langchain.chains.conversational_retrieval.base import ConversationalRetrievalChain
# from langchain_chroma import Chroma
# import speech_recognition as sr
# from gtts import gTTS
# from pydub import AudioSegment
# from pydub.playback import play
# import json
# import sys
# import argparse
# import base64
# import tempfile


# # ----------------- Load API Key -----------------
# load_dotenv()
# TOGETHER_API_KEY = os.environ.get('TOGETHER_API_KEY')

# # ----------------- Chroma Setup -----------------
# PDF_PATH = r"A-Z Family Medical Encyclopedia.pdf"
# CHROMA_DB_PATH = "chroma_db2"

# embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
# if os.path.exists(CHROMA_DB_PATH):
#     vectorstore = Chroma(persist_directory=CHROMA_DB_PATH, embedding_function=embeddings)
# else:
#     # First run: Build DB
#     document = PyMuPDFLoader(file_path=PDF_PATH, mode='single')
#     docs = document.load()

#     text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=50)
#     text_data = [doc.page_content for doc in docs]
#     texts = text_splitter.create_documents(text_data)

#     vectorstore = Chroma.from_documents(texts, embeddings, persist_directory=CHROMA_DB_PATH)
#     vectorstore.persist()

# # Create retriever
# retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

# # ----------------- LLM Models -----------------
# medical_llm = ChatTogether(
#     together_api_key=TOGETHER_API_KEY,
#     model="meta-llama/Llama-3.3-70B-Instruct-Turbo",   # Big model for accuracy
#     max_tokens=300
# )

# general_llm = ChatTogether(
#     together_api_key=TOGETHER_API_KEY,
#     model="meta-llama/Llama-3.1-8B-Instruct-Turbo",   # Smaller & faster for greetings
#     max_tokens=150
# )

# # ----------------- Memory -----------------
# message_history = ChatMessageHistory()
# memory = ConversationBufferMemory(
#     chat_memory=message_history,
#     memory_key="chat_history",
#     input_key="question",
#     output_key="answer",
#     return_messages=True,
#     human_prefix="Human",
#     ai_prefix="AI",
# )

# # ----------------- Prompt Templates -----------------
# def get_prompt_template(lang: str, general=False):
#     if lang == "te":
#         if general:
#             return PromptTemplate.from_template("""
#             మీరు ఒక స్నేహపూర్వక, సహాయక AI సహాయకుడు.
#             ఎల్లప్పుడూ స్పష్టంగా మరియు పూర్తి వాక్యాలతో తెలుగులో సమాధానం ఇవ్వండి.

#             గత సంభాషణ:
#             {chat_history}

#             మనిషి ప్రశ్న:
#             {question}

#             సూచనలు:
#             - వాక్యాలు ఎప్పుడూ మధ్యలో ఆగకుండా పూర్తి వాక్యాలతో ఇవ్వండి.
#             - స్నేహపూర్వకంగా మరియు సహాయంగా ఉండాలి.
#             """)
#         else:
#             return PromptTemplate.from_template("""
#             మీరు ఒక సహాయక వైద్య AI సహాయకుడు.
#             ఎల్లప్పుడూ స్పష్టంగా మరియు పూర్తిగా తెలుగు వాక్యాలలో సమాధానం ఇవ్వండి.

#             గత సంభాషణ:
#             {chat_history}

#             మనిషి ప్రశ్న:
#             {question}

#             పుస్తక సమాచారంలో నుండి:
#             {context}

#             సూచనలు:
#             - వాక్యాలు ఎప్పుడూ మధ్యలో ఆగకుండా పూర్తి వాక్యాలతో ఇవ్వాలి.
#             - సమాధానం తెలుగు లో ఇవ్వాలి (1-2 వాక్యాలు సరళంగా).
#             - అవసరమైతే రెండు లేదా మూడు వాక్యాలు వాడవచ్చు.
#             """)
#     else:
#         if general:
#             return PromptTemplate.from_template("""
#             You are a friendly and helpful AI assistant.
#             Always reply in complete and fluent English sentences.

#             Previous conversation:
#             {chat_history}

#             Human question:
#             {question}

#             Instructions:
#             - Give full, fluent sentences.
#             - Respond in a friendly and helpful tone.
#             """)
#         else:
#             return PromptTemplate.from_template("""
#             You are a helpful medical AI assistant.
#             Always reply in complete and fluent English sentences.

#             Previous conversation:
#             {chat_history}

#             Human question:
#             {question}

#             Context from documents:
#             {context}

#             Instructions:
#             - Give a full and complete answer in English sentences.
#             - Never stop mid-sentence.
#             - Respond in English (1-2 sentences, simple words).
#             - You may use two or three sentences if needed.
#             """)

# # ----------------- Speech Utils -----------------
# def play_beep():
#     duration = 200  # ms
#     freq = 800
#     try:
#         import winsound
#         winsound.Beep(freq, duration)
#     except:
#         beep = AudioSegment.silent(duration=200).overlay(AudioSegment.sine(freq, duration=200))
#         play(beep)

# def listen_speech():
#     r = sr.Recognizer()
#     with sr.Microphone() as source:
#         play_beep()
#         r.adjust_for_ambient_noise(source)
#         audio = r.listen(source)

#     text_te, text_en = None, None
#     try:
#         text_te = r.recognize_google(audio, language="te-IN")
#     except:
#         pass
#     try:
#         text_en = r.recognize_google(audio, language="en-IN")
#     except:
#         pass

#     if text_te and (not text_en or len(text_te) >= len(text_en)):
#         return text_te, "te"
#     elif text_en:
#         return text_en, "en"
#     else:
#         return None, None

# def transcribe_file(file_path):
#     r = sr.Recognizer()
#     try:
#         with sr.AudioFile(file_path) as source:
#             audio = r.record(source)
#     except Exception as e:
#         return None, None

#     text_te, text_en = None, None
#     try:
#         text_te = r.recognize_google(audio, language="te-IN")
#     except Exception:
#         pass
#     try:
#         text_en = r.recognize_google(audio, language="en-IN")
#     except Exception:
#         pass

#     if text_te and (not text_en or len(text_te) >= len(text_en)):
#         return text_te, "te"
#     elif text_en:
#         return text_en, "en"
#     else:
#         return None, None

# def speak_text(text, lang):
#     tts = gTTS(text=text, lang="te" if lang == "te" else "en")
#     filename = f"response_{uuid.uuid4().hex}.mp3"
#     tts.save(filename)
#     audio = AudioSegment.from_file(filename, format="mp3")
#     play(audio)
#     try:
#         os.remove(filename)
#     except:
#         pass

# def tts_base64(text, lang):
#     # generate tts mp3 to temporary file and return base64 string
#     tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
#     try:
#         tts = gTTS(text=text, lang="te" if lang == "te" else "en")
#         tts.save(tmp.name)
#         with open(tmp.name, "rb") as f:
#             b64 = base64.b64encode(f.read()).decode("ascii")
#         return b64
#     finally:
#         try:
#             tmp.close()
#         except:
#             pass

# # ----------------- General vs Medical -----------------
# def is_general_question(text):
#     keywords = ["hi","hello","thanks","thank you","bye","goodbye","how are you","good morning","ok","okay"]
#     return any(k.lower() in text.lower() for k in keywords)

# # # ----------------- Main Processing -----------------
# def process_question(question, lang):
#     if is_general_question(question):
#         # Use smaller/faster model
#         prompt_template = get_prompt_template(lang, general=True)
#         direct_prompt = prompt_template.format(chat_history="", question=question)
#         answer = general_llm.invoke(direct_prompt).content

#         # Hardcoded fallback if LLM fails
#         if not answer.strip():
#             hardcoded = {
#                 "hi": "Hello! How can I help you today?",
#                 "hello": "Hi there! What can I do for you?",
#                 "thanks": "You're welcome!",
#                 "thank you": "You're most welcome!",
#                 "bye": "Goodbye! Take care.",
#                 "goodbye": "See you again soon!",
#                 "how are you": "I am doing great! How about you?",
#                 "good morning": "Good morning! Wishing you a healthy day ahead."
#             }
#             for k, v in hardcoded.items():
#                 if k in question.lower():
#                     return v
#     else:
#         # Use bigger/accurate model
#         prompt_template = get_prompt_template(lang, general=False)
#         conversation_chain = ConversationalRetrievalChain.from_llm(
#             llm=medical_llm,
#             retriever=retriever,
#             memory=memory,
#             verbose=False,
#             return_source_documents=True,
#             combine_docs_chain_kwargs={"prompt": prompt_template},
#         )
#         response = conversation_chain.invoke({"question": question})
#         answer = response['answer']

#         # Fallback: no sources or empty response
#         if not response["source_documents"] or answer.strip() == "":
#             direct_prompt = prompt_template.format(
#                 chat_history="", question=question, context="(No book context)"
#             )
#             answer = medical_llm.invoke(direct_prompt).content

#     return answer



# # ----------------- For Command Line Testing -----------------

# if __name__ == "__main__":
#     parser = argparse.ArgumentParser()
#     parser.add_argument("--audio", help="path to audio file to transcribe", required=False)
#     args = parser.parse_args()

#     if args.audio:
#         transcript, detected_lang = transcribe_file(args.audio)
#         if not transcript:
#             out = {"error": "transcription_failed"}
#             print(json.dumps(out, ensure_ascii=False))
#             sys.exit(0)

#         answer = process_question(transcript, detected_lang or "en")
#         try:
#             b64 = tts_base64(answer, detected_lang or "en")
#         except Exception:
#             b64 = None

#         out = {
#             "transcript": transcript,
#             "lang": detected_lang,
#             "answer": answer,
#             "tts_base64": b64
#         }
#         print(json.dumps(out, ensure_ascii=False))
#         sys.exit(0)

