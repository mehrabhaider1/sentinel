from google import genai

from app.core.settings import settings

client = genai.Client(
    api_key=settings.GOOGLE_API_KEY,
)

response = client.models.generate_content(
    model="models/gemma-4-31b-it",
    contents="Say hello in one sentence."
)

print(response.text)