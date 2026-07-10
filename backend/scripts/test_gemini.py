from app.agents.ai_client import AIClient


def main() -> None:
    client = AIClient()

    response = client.generate(
        "In one sentence, explain what Sentinel AI is."
    )

    print()
    print("Gemini Response:")
    print(response)
    print()


if __name__ == "__main__":
    main()