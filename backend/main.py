# backend/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from backend.routes import auth, estoque, usuario_routes
from backend.database.connection import engine
import logging, traceback

app = FastAPI(
    title="Sistema de Controle de Roupas Estéreis",
    version="1.0.0",
    description="API para controle e rastreio de roupas estéreis"
)

# 🧠 Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# 🌐 CORS (MANTER ANTES das rotas e dos middlewares personalizados)


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://sicro-bqcl.vercel.app",
    "https://sicro.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,   # se não usar cookies no front, pode pôr False
    allow_methods=["*"],
    allow_headers=["*"],
)



# 🧩 Rotas
app.include_router(auth.router, prefix="/api")
app.include_router(estoque.router, prefix="/api")
app.include_router(usuario_routes.router, prefix="/api")

# 💥 Middleware de erro global (depois do CORS)
@app.middleware("http")
async def global_error_handler(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logging.error(f"Erro interno: {e}", exc_info=True)
        traceback.print_exc()

        # 🔥 Retorna erro mas com cabeçalhos CORS garantidos
        headers = {
            "Access-Control-Allow-Origin": request.headers.get("origin") or "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
        return JSONResponse(
            status_code=500,
            content={"detail": "Erro interno do servidor"},
            headers=headers,
        )

# 🚫 Handlers de erros
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": str(exc.detail)},
        headers={"Access-Control-Allow-Origin": request.headers.get("origin") or "*"},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc):
    return JSONResponse(
        status_code=422,
        content={"detail": "Erro de validação", "errors": exc.errors()},
        headers={"Access-Control-Allow-Origin": request.headers.get("origin") or "*"},
    )

@app.get("/")
def root():
    return {"message": "API Sicro rodando 🚀"}
