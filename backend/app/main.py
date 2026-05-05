from fastapi import FastAPI


app = FastAPI(title="404HexaNotFound API")

@app.get("/health")
def health_check():
    return {"status": "ok"}
