import os
import json

from flask import Blueprint, current_app, request, Response, stream_with_context

from openai import OpenAI


blueprint_api_portfolio_chat = Blueprint("blueprint_api_portfolio_chat", __name__)

# Configuration via environment variables (with defaults for optimization)
CV_MAX_CHARS = int(
    os.getenv("CV_MAX_CHARS", "3000")
)  # Reduced from 8000 for faster processing
CHAT_MODEL = os.getenv(
    "PORTFOLIO_CHAT_MODEL", "llama3.2:3b"
)  # Faster model (was llama3:8b)
CHAT_MAX_TOKENS = int(
    os.getenv("CHAT_MAX_TOKENS", "500")
)  # Reduced from 800 for faster responses

# Global cache for CV text (manual cache to avoid caching empty results)
_cv_text_cache = None


def _clear_cv_cache():
    """Clear the CV text cache. Useful after fixing CV loading issues."""
    global _cv_text_cache
    _cv_text_cache = None


def _extract_cv_summary(cv_text: str, max_chars: int = None) -> str:
    """
    Extract and prioritize key sections from CV for faster processing.
    Focuses on important information like personal details, experience, skills, education.
    """
    if max_chars is None:
        max_chars = CV_MAX_CHARS

    if len(cv_text) <= max_chars:
        return cv_text

    # Keywords to identify important sections
    important_keywords = [
        # Personal information
        "nombre",
        "name",
        "email",
        "correo",
        "teléfono",
        "phone",
        "móvil",
        "mobile",
        "ubicación",
        "location",
        "ciudad",
        "city",
        "address",
        "dirección",
        "país",
        "country",
        # Experience
        "experiencia",
        "experience",
        "trabajo",
        "work",
        "empleo",
        "job",
        "cargo",
        "position",
        "empresa",
        "company",
        "proyecto",
        "project",
        "responsabilidades",
        "responsibilities",
        # Skills
        "habilidades",
        "skills",
        "tecnologías",
        "technologies",
        "tools",
        "herramientas",
        "lenguajes",
        "languages",
        "frameworks",
        "bases de datos",
        "databases",
        # Education
        "educación",
        "education",
        "estudios",
        "university",
        "universidad",
        "grado",
        "degree",
        "certificación",
        "certification",
        "curso",
        "course",
        # Other important
        "logros",
        "achievements",
        "idiomas",
        "languages",
        "referencias",
        "references",
    ]

    lines = cv_text.split("\n")
    important_lines = []
    regular_lines = []

    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue

        line_lower = line_stripped.lower()
        # Check if line contains important keywords
        is_important = any(keyword in line_lower for keyword in important_keywords)

        if is_important:
            important_lines.append(line)
        else:
            regular_lines.append(line)

    # Combine: important lines first, then regular lines until limit
    result_lines = important_lines + regular_lines
    result_text = "\n".join(result_lines)

    if len(result_text) > max_chars:
        # Truncate but try to keep important lines
        truncated = result_text[:max_chars]
        # Try to cut at a newline near the limit (keep 80% of important content)
        last_newline = truncated.rfind("\n")
        if last_newline > max_chars * 0.8:  # If last newline is close to limit
            truncated = truncated[:last_newline]

        # Count how many important lines we kept
        kept_important = sum(1 for line in important_lines if line in truncated)
        total_important = len(important_lines)

        summary_note = f"\n\n[CV resumido - {kept_important}/{total_important} líneas clave incluidas]"
        return truncated + summary_note

    return result_text


def _load_cv_text() -> str:
    """
    Load CV text from the PDF located in backend/docs-md or other fallback paths.
    This is cached in memory to avoid re-reading on every request.
    Only successful loads (non-empty text) are cached.
    """
    global _cv_text_cache

    # Return cached value if available
    if _cv_text_cache is not None:
        return _cv_text_cache

    try:
        # Try multiple possible paths for the CV
        # current_app.root_path -> /app/portfolio_app
        # backend_root -> /app  (repo root inside the container)
        backend_root = os.path.abspath(os.path.join(current_app.root_path, ".."))

        # Path 1: Inside backend/docs-md (preferred location)
        cv_path = os.path.join(backend_root, "docs-md", "CV_Jose_Ruiz.pdf")

        # Path 2: Frontend public folder (if repo is fully mounted)
        if not os.path.exists(cv_path):
            cv_path = os.path.join(
                backend_root, "frontend", "public", "CV_Jose_Ruiz.pdf"
            )

        # Path 3: Inside backend/resources (fallback)
        if not os.path.exists(cv_path):
            cv_path = os.path.join(backend_root, "resources", "CV_Jose_Ruiz.pdf")

        # Path 4: Relative to portfolio_app (last fallback)
        if not os.path.exists(cv_path):
            cv_path = os.path.join(
                current_app.root_path, "resources", "CV_Jose_Ruiz.pdf"
            )

        if not os.path.exists(cv_path):
            current_app.logger.warning(
                f"CV file not found. Tried paths: {backend_root}/docs-md/, {backend_root}/frontend/public/, {backend_root}/resources/, {current_app.root_path}/resources/"
            )
            return ""

        current_app.logger.info(f"CV file found at: {cv_path}")

        try:
            import PyPDF2  # type: ignore
        except ImportError:
            current_app.logger.error(
                "PyPDF2 not installed. Cannot extract text from CV PDF. Please install: pip install PyPDF2"
            )
            return ""

        text_chunks = []
        with open(cv_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                try:
                    page_text = page.extract_text() or ""
                    text_chunks.append(page_text)
                except Exception as page_err:  # pragma: no cover - defensive
                    current_app.logger.warning(
                        f"Error extracting text from CV page: {page_err}"
                    )

        full_text = "\n\n".join(text_chunks)

        if not full_text or len(full_text.strip()) == 0:
            current_app.logger.warning("CV text extraction resulted in empty content")
            return ""

        # Use intelligent summary extraction instead of simple truncation
        # This prioritizes important sections (personal info, experience, skills, etc.)
        optimized_text = _extract_cv_summary(full_text, max_chars=CV_MAX_CHARS)

        if len(full_text) > CV_MAX_CHARS:
            current_app.logger.info(
                f"CV text optimized from {len(full_text)} to {len(optimized_text)} chars "
                f"(using intelligent summary extraction)"
            )

        # Only cache successful loads (non-empty text)
        _cv_text_cache = optimized_text
        current_app.logger.info(
            f"CV text loaded successfully ({len(optimized_text)} chars)"
        )
        return optimized_text
    except Exception as e:  # pragma: no cover - defensive
        current_app.logger.error(f"Error loading CV text: {e}")
        return ""


def _get_ollama_client() -> OpenAI:
    """
    Create an OpenAI-compatible client configured for Ollama.
    """
    # Try explicit env first
    base_url = os.getenv("OLLAMA_BASE_URL")

    # Fallback to host.docker.internal when running in Docker
    is_docker = os.path.exists("/.dockerenv") or os.getenv("DOCKER_CONTAINER")
    if not base_url:
        if is_docker:
            base_url = "http://host.docker.internal:11434/v1"
        else:
            base_url = "http://localhost:11434/v1"

    client = OpenAI(
        api_key="ollama",  # dummy key for Ollama
        base_url=base_url,
        timeout=300.0,
    )
    return client


def _build_system_prompt(role: str, language: str = "en") -> str:
    """
    Build a system prompt for the portfolio assistant including CV context.

    Args:
        role: "visitor" or "recruiter"
        language: Language code ("es", "de", "en", "pl", "uk")
    """
    cv_text = _load_cv_text()

    # Language mapping
    language_names = {
        "es": "Spanish (Español)",
        "de": "German (Deutsch)",
        "en": "English",
        "pl": "Polish (Polski)",
        "uk": "Ukrainian (Українська)",
    }

    language_name = language_names.get(language, "English")
    language_instruction = (
        f"\n\nIMPORTANT: You MUST respond in {language_name}. "
        f"All your responses should be written in {language_name}. "
        f"If the user writes in a different language, still respond in {language_name}.\n\n"
    )

    base_intro = (
        "You are a personal AI assistant representing the software developer "
        "and data analyst Jose Ruiz (also known as ruizdev7). "
        "You answer as if you were Jose, but always honestly clarify that you "
        "are an AI assistant when relevant."
    ) + language_instruction

    if role == "recruiter":
        role_section = (
            "The user is a recruiter, HR specialist or hiring manager reviewing "
            "Jose's profile for job or project opportunities.\n\n"
            "Your goals:\n"
            "- Highlight relevant experience, technologies and projects.\n"
            "- Answer typical recruiting questions (experience, strengths, fit, availability, location).\n"
            "- Be structured, concise and professional.\n"
            "- Use the CV content below to answer all factual questions accurately.\n\n"
        )
    else:
        role_section = (
            "The user is a potential client, collaborator or visitor interested in "
            "Joseph's services (development, data, automation, DevOps, etc.).\n\n"
            "Your goals:\n"
            "- Understand the user's context and needs.\n"
            "- Explain how Joseph could help in practical terms.\n"
            "- Suggest clear next steps (e.g. contact form, call, collaboration ideas).\n\n"
        )

    cv_section = ""
    if cv_text:
        cv_section = (
            "Below is the CV / resume content of Jose Ruiz. Use it as factual context "
            "when answering ALL questions. Extract and use the information from the CV "
            "to provide accurate answers about Jose's experience, location, skills, education, etc.\n\n"
            "=== CV START ===\n"
            f"{cv_text}\n"
            "=== CV END ===\n\n"
            "When answering:\n"
            "- ALWAYS use the CV content above to answer factual questions.\n"
            "- Be accurate with technologies, roles, experience, location, education, and all details.\n"
            "- If information is in the CV, use it. If not, say you don't have that information.\n"
            "- Avoid inventing employers, dates, skills, or any details not present in the CV.\n"
            "- You may answer in Spanish or English depending on the user's language.\n"
        )
    else:
        cv_section = (
            "WARNING: CV content could not be loaded. You should inform the user that "
            "you are unable to access Jose's CV details at the moment.\n\n"
        )

    return base_intro + role_section + cv_section


@blueprint_api_portfolio_chat.route("/api/v1/portfolio/chat-stream", methods=["POST"])
def portfolio_chat_stream():
    """
    Streaming chat endpoint for the public portfolio page.

    Payload:
    {
      "role": "visitor" | "recruiter",
      "language": "es" | "de" | "en" | "pl" | "uk", // optional, defaults to "en"
      "messages": [
        { "role": "user" | "assistant", "content": "..." },
        ...
      ],
      "model": "llama3:8b" // optional, defaults to env or llama3:8b
    }

    Response: text/event-stream with JSON lines:
      data: {"type":"chunk","content":"..."}
      data: {"type":"error","error":"..."}
      data: {"type":"complete"}
    """
    try:
        payload = request.get_json(silent=True) or {}
        role = payload.get("role", "visitor")
        language = payload.get("language", "en")  # Default to English
        messages = payload.get("messages") or []
        model_name = (
            payload.get("model") or os.getenv("PORTFOLIO_CHAT_MODEL") or CHAT_MODEL
        )

        if role not in ("visitor", "recruiter"):
            role = "visitor"

        # Validate language code
        valid_languages = {"es", "de", "en", "pl", "uk"}
        if language not in valid_languages:
            language = "en"

        # Build OpenAI-style messages
        system_prompt = _build_system_prompt(role, language)
        openai_messages = [{"role": "system", "content": system_prompt}]

        # Append conversation so far (only user/assistant roles)
        for msg in messages:
            r = msg.get("role")
            c = msg.get("content", "")
            if r in ("user", "assistant") and c:
                openai_messages.append({"role": r, "content": c})

        client = _get_ollama_client()

        def generate():
            def send_event(obj):
                data = json.dumps(obj, ensure_ascii=False)
                yield f"data: {data}\n\n"

            try:
                # Initial status event
                yield from send_event(
                    {
                        "type": "status",
                        "message": "Generando respuesta con modelo local...",
                    }
                )

                stream = client.chat.completions.create(
                    model=model_name,
                    messages=openai_messages,
                    temperature=0.3,
                    max_tokens=CHAT_MAX_TOKENS,  # Optimized: reduced from 800 to 500
                    stream=True,
                )

                for chunk in stream:
                    delta = chunk.choices[0].delta
                    if delta and getattr(delta, "content", None):
                        yield from send_event(
                            {"type": "chunk", "content": delta.content}
                        )

                # Completion event
                yield from send_event({"type": "complete"})

            except Exception as e:  # pragma: no cover - defensive
                current_app.logger.error(f"Portfolio chat streaming error: {e}")
                yield from send_event(
                    {
                        "type": "error",
                        "error": str(e),
                    }
                )

        return Response(
            stream_with_context(generate()),
            mimetype="text/event-stream",
        )
    except Exception as outer_err:  # pragma: no cover - defensive
        current_app.logger.error(f"Portfolio chat endpoint error: {outer_err}")
        return (
            {"error": "Error interno en el chat del portfolio"},
            500,
        )
