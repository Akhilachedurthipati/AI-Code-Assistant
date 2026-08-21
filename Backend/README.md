# AI Code Assistant Backend

FastAPI Python backend for the AI Code Assistant project.

## Setup Instructions

1. Install Python 3.8+
2. Navigate to the `backend` directory.
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file from the template and enter your OpenAI API key and MySQL details:
   ```env
   OPENAI_API_KEY=your_api_key_here
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=ai_code_assistant
   ```
5. Run the FastAPI development server:
   ```bash
   python main.py
   ```
   The backend API will run at `http://127.0.0.1:8000`.
