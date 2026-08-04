# Contributing Guide

Thanks for collaborating on this repo!

## Workflow

1. **Pull the latest `main` before starting work:**
```bash
   git checkout main
   git pull origin main
```

2. **Create a new branch for your change:**
```bash
   git checkout -b feature/short-description
```

3. **Make your changes, then commit:**
```bash
   git add .
   git commit -m "Clear, descriptive commit message"
```

4. **Push your branch:**
```bash
   git push origin feature/short-description
```

5. **Open a Pull Request** on GitHub comparing your branch into `main`.
   - Give it a clear title and short description of what changed and why.

6. **Wait for review/approval** before merging (if required), then merge via GitHub's UI.

## Rules

- **Never push directly to `main`.** All changes go through a Pull Request.
- **One feature/fix per branch** — keep PRs focused and easy to review.
- **Delete your branch** after it's merged.

## Environment variables

Never commit `.env` files or real credentials. Check `.gitignore` before committing if you're unsure.
