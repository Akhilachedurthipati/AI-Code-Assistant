import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

SYSTEM_PROMPT = """You are AI Code Assistant, an expert programming partner.

Your job is to help users with programming questions.

You support:
- Code generation
- Code explanation
- Code debugging
- Code completion

Answer the user's natural-language question directly.

When providing code:
- Preserve proper indentation.
- Preserve line breaks.
- Use Markdown fenced code blocks.
- Put the programming language name after the opening code fence.
- Do not put code on a single line.
- Do not add unnecessary HTML.
- Do not claim that you executed or tested code unless you actually did.

Give clear and beginner-friendly explanations when appropriate.
"""


def _clean_env(name: str) -> str | None:
    value = os.getenv(name)

    if not value:
        return None

    return value.strip().strip('"').strip("'")


def get_client() -> tuple[OpenAI, str]:
    """
    Create the AI client.

    Gemini is used first through Google's OpenAI-compatible API.
    OpenAI is supported as a fallback if an OpenAI API key is configured.
    """

    gemini_key = (
        _clean_env("GEMINI_API_KEY")
        or _clean_env("GEMINII_API_KEY")
    )

    openai_key = _clean_env("OPENAI_API_KEY")

    # Use Gemini
    if gemini_key and gemini_key != "your_gemini_api_key_here":
        client = OpenAI(
            api_key=gemini_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )

        # Current Gemini model
        return client, "gemini-2.0-flash"

    # Use OpenAI if configured
    if openai_key and openai_key != "your_openai_api_key_here":
        client = OpenAI(
            api_key=openai_key
        )

        return client, "gpt-4o-mini"

    raise RuntimeError(
        "AI API key is not configured. "
        "Please add GEMINI_API_KEY to the backend environment."
    )


def get_chat_response(
    messages_history: list[dict],
    new_message: str,
    feature: str = "GENERATE"
) -> str:

    client, model = get_client()

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },
        {
            "role": "system",
            "content": (
                f"The selected capability is {feature}. "
                "Interpret the user's request naturally."
            )
        }
    ]

    # Add previous conversation
    for item in messages_history:

        role = item.get("role")

        content = (
            item.get("content")
            or item.get("message")
        )

        if role in {"user", "assistant"} and content:
            messages.append(
                {
                    "role": role,
                    "content": content
                }
            )

    # Add current user message
    messages.append(
        {
            "role": "user",
            "content": new_message
        }
    )

    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.2
        )

    except Exception as e:
        # Do NOT return a mock response.
        # Return the actual AI provider error to FastAPI.
        raise RuntimeError(
            f"AI API request failed: {str(e)}"
        ) from e

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError(
            "The AI provider returned an empty response."
        )

    return content