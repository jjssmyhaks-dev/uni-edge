"""
Uni-Edge AI Service
Document parsing (LlamaParse) and AI-assisted workflows.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import httpx

load_dotenv()

# Initialize New Relic if license key is provided
new_relic_license = os.getenv("NEW_RELIC_LICENSE_KEY")
if new_relic_license:
    import newrelic.agent
    newrelic.agent.initialize()

app = FastAPI(
    title="Uni-Edge AI Service",
    description="Document parsing and AI-assisted workflows for Uni-Edge",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# Health Check
# ============================================

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "ai-service",
        "version": "0.1.0",
    }


# ============================================
# Request/Response Models
# ============================================

class ParseDocumentRequest(BaseModel):
    file_url: str
    document_type: str  # marksheet, id_proof, category_cert, etc.


class ExtractedData(BaseModel):
    confidence: float = 0.0
    raw_text: str = ""
    extracted_fields: dict = {}


class ParseDocumentResponse(BaseModel):
    extracted_data: ExtractedData
    success: bool = True
    message: str = ""


class VerifyDocumentRequest(BaseModel):
    parsed_data: dict
    entered_data: dict
    document_type: str


class VerifyDocumentResponse(BaseModel):
    matches: bool
    mismatches: list[dict] = []
    confidence: float = 0.0


class ExtractMarksRequest(BaseModel):
    file_url: str


class SubjectMark(BaseModel):
    subject: str
    marks_obtained: float
    max_marks: float
    grade: str | None = None


class ExtractMarksResponse(BaseModel):
    subjects: list[SubjectMark] = []
    total_marks: float = 0.0
    percentage: float = 0.0
    result: str = ""


# ============================================
# Document Parsing Endpoints
# ============================================

@app.post("/parse-document", response_model=ParseDocumentResponse)
async def parse_document(request: ParseDocumentRequest):
    """
    Parse an uploaded document using LlamaParse.
    Extracts structured data from marksheets, ID proofs, etc.

    TODO: Implement LlamaParse integration when API key is available.
    """
    # Stub implementation — returns empty extraction
    # In production, this would:
    # 1. Download the file from Supabase Storage
    # 2. Send to LlamaParse API
    # 3. Parse the response and extract structured fields

    return ParseDocumentResponse(
        extracted_data=ExtractedData(
            confidence=0.0,
            raw_text="",
            extracted_fields={},
        ),
        success=True,
        message="LlamaParse integration pending — stub response",
    )


@app.post("/verify-document", response_model=VerifyDocumentResponse)
async def verify_document(request: VerifyDocumentRequest):
    """
    Cross-check parsed document data against applicant-entered data.
    Flags mismatches for manual review.
    """
    # Stub implementation — compares keys and values
    mismatches = []
    for key in request.entered_data:
        if key in request.parsed_data:
            if str(request.parsed_data[key]).lower().strip() != str(request.entered_data[key]).lower().strip():
                mismatches.append({
                    "field": key,
                    "parsed_value": request.parsed_data[key],
                    "entered_value": request.entered_data[key],
                })

    return VerifyDocumentResponse(
        matches=len(mismatches) == 0,
        mismatches=mismatches,
        confidence=0.9 if len(mismatches) == 0 else 0.5,
    )


@app.post("/extract-marks", response_model=ExtractMarksResponse)
async def extract_marks(request: ExtractMarksRequest):
    """
    Specialized marksheet parsing — extracts subject-wise marks.
    """
    # Stub implementation
    return ExtractMarksResponse(
        subjects=[],
        total_marks=0.0,
        percentage=0.0,
        result="Pending LlamaParse integration",
    )
