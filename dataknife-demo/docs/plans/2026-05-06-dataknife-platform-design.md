# DataKnife Platform Design

## Scope

Build a Next.js App Router platform shell for enterprise knowledge intake.

## Interface

The root layout owns a narrow sidebar with the home route and a right-side ChatKit panel. The home screen presents business areas in a carousel and a document upload bay below it.

## Data Flow

Text and document-like files are uploaded through `POST /api/uploads/documents`, converted to OpenAI Files, and attached to the configured OpenAI Vector Store through a file batch. Structured formats such as CSV, Excel, JSONL, and table-oriented files are routed to a placeholder that can be replaced by Supabase persistence and processing.

## ChatKit

The client uses `@openai/chatkit-react`. The server creates ChatKit sessions through the OpenAI SDK using `OPENAI_CHATKIT_WORKFLOW_ID`, returning only the ephemeral client secret to the browser.

## Configuration

Required environment variables are documented in `.env.example`.
