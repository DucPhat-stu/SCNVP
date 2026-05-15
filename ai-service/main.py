"""
SCNVP — AI Service
FastAPI + LangChain for AI-powered network assistance.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="SCNVP AI Service",
    description="AI assistant for network design using LangChain + Claude",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health Check ─────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-service"}


# ── Models ───────────────────────────────────────
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    project_id: Optional[str] = None
    conversation_history: list[ChatMessage] = []


class SuggestRequest(BaseModel):
    project_id: str


class GenerateRequest(BaseModel):
    prompt: str
    project_id: Optional[str] = None


class CodegenRequest(BaseModel):
    project_id: str
    target_device: str = "CISCO_IOS"
    node_ids: list[str] = []


# ── Routes ───────────────────────────────────────
@app.post("/chat")
async def chat(req: ChatRequest):
    """
    Chat with AI assistant.
    TODO: Integrate LangChain + Claude for real responses.
    Currently returns a placeholder.
    """
    return {
        "success": True,
        "data": {
            "response": f"[AI Placeholder] You asked: '{req.message}'. "
            "LangChain integration coming in Sprint 3.",
            "done": True,
        },
    }


@app.post("/suggest")
async def suggest(req: SuggestRequest):
    """Get AI architecture suggestions for a project topology."""
    return {
        "success": True,
        "data": {
            "suggestions": [
                {
                    "id": "sug_placeholder",
                    "type": "REDUNDANCY",
                    "severity": "MEDIUM",
                    "title": "Placeholder suggestion",
                    "description": "AI analysis will be available after LangChain integration.",
                    "estimated_cost_impact": 0,
                    "confidence_score": 0.0,
                }
            ]
        },
    }


@app.post("/generate")
async def generate_topology(req: GenerateRequest):
    """Auto-generate a network topology from natural language."""
    return {
        "success": True,
        "data": {
            "nodes": [],
            "connections": [],
            "explanation": f"[Placeholder] Would generate topology for: '{req.prompt}'",
            "estimated_cost": 0,
        },
    }


@app.post("/codegen")
async def generate_config(req: CodegenRequest):
    """Generate device configuration code."""
    return {
        "success": True,
        "data": {
            "configs": [
                {
                    "node_id": nid,
                    "device_type": req.target_device,
                    "config": f"! Placeholder config for {nid}\nhostname placeholder\n",
                }
                for nid in req.node_ids
            ]
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
