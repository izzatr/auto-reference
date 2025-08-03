# Auto-Reference: Collaborative Bibliography Management

This application is a real-time collaborative tool for managing bibliographies. It allows users to create shared projects, automatically generate bibliographic entries from URLs, edit them, and add comments.

## Features

- **Automatic Reference Generation**: Paste a list of URLs to automatically create bibliographic entries.
- **Real-time Collaboration**: Work with others on the same bibliography project. Changes are synchronized in real-time across all users.
- **In-place Editing**: Edit reference details like title, author, and BibTeX directly in the browser.
- **Commenting**: Add comments to individual references to discuss or leave notes.
- **BibTeX Export**: Export the entire bibliography of a project to a `.bib` file, ready for use with LaTeX and other academic tools.

## How it Works

1.  **Create a Project**: On the home page, paste one or more URLs into the text area and click "Process".
2.  **Collaboration**: A new project is created, and you are redirected to the project page. You can share this page's URL with collaborators.
3.  **Edit and Comment**: All changes and comments are instantly visible to everyone on the project page.
4.  **Export**: Click the "Export to .bib" button to download the bibliography.

## Tech Stack

- **Frontend**: Vue 3, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL Database, Realtime Subscriptions) & N8N Workflow
- **Data Fetching**: GraphQL (via Apollo Client)
- **Styling**: Tailwind CSS, shadcn-vue
