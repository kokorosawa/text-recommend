import os
from fastapi import FastAPI, HTTPException
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from chromadb.config import Settings
from langchain_core.documents import Document
from datetime import datetime
from schemas.TextItem import TextItem
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

app = FastAPI()

load_dotenv()
model = os.getenv("model")
ollama_url = os.getenv("ollama_url")

Embedding_Model = "all-minilm:latest"
vector_store = Chroma(
    collection_name="plugin",
    embedding_function=OllamaEmbeddings(model=Embedding_Model, base_url=ollama_url),
    client_settings=Settings(),
)

llm = OllamaLLM(model=model, num_gpu=1)


@app.post("/upload")
async def upload_text(text: TextItem):
    try:
        vector_store.add_documents(
            documents=[Document(page_content=text.content)],
            ids=[datetime.now().isoformat()],
        )
        return {"message": "Text uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommend")
async def recommend_text(text: TextItem):
    try:
        results = vector_store.similarity_search(query=text.content, k=5)
        retrieve_data = "\n".join([f"{doc.page_content}" for doc in results])
        for doc in results:
            print(f"{doc.page_content}")

        template = """
            <|begin_of_text|>
            <|start_header_id|>system<|end_header_id|>
            You are an intelligent autocomplete assistant specializing in providing natural, accurate, and context-aware text completion suggestions. Based on the user’s input, complete the subsequent content.
            Guidelines:
            1.Infer the context and tone (formal, informal, technical, or creative) from the user’s input text.
            2.Automatically complete the following sentence based on the content, ensuring semantic fluency and alignment with the context.
            3.If the input is in Chinese, respond in Traditional Chinese.
            4.Only output the completion words without explanations or the original input text.
            5.Don't repeat the input text in the completion.
            6.using the follow prompts, help me complete current sentence.
            Complete this sentence with one or more words.
            <|eot_id|>
            <|start_header_id|>user<|end_header_id|>
            {user_prompt}
            <|eot_id|>
            <|start_header_id|>assistant<|end_header_id|>
            """
        prompt = PromptTemplate(input_variables=["user_prompt"], template=template)
        response = llm.invoke(prompt.format(user_prompt=retrieve_data))
        print(response)

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
