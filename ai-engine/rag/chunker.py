from langchain_text_splitters import RecursiveCharacterTextSplitter

def create_chunker(chunk_size:int=800,overlap:int=200):
    return RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", ", ", " ", ""]
    )

def chunk_document(text:str,metadata:dict=None)->list[dict]:
    chunk=create_chunker().split_text(text)
    return [
        {"text":c,"metadata":{**(metadata or {}),"chunk_index":i}} for i,c in enumerate(chunk)
    ]