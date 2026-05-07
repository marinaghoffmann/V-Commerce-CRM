from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from app.routers.router import router
from app.routers import cliente360 

app = FastAPI(title="404HexaNotFound API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(cliente360.router) 

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)