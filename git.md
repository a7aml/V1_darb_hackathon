# StudyGPT — Git Team Workflow Guide
> Read this before you touch any code. Follow this every single day.

---

## BRANCH STRUCTURE

```
main              ← clean, working, final only
dev               ← team merges here first
person1/auth
person2/rag
person3/quiz
person4/frontend-core
person5/frontend-wow
```

---

## DAILY ROUTINE — RUN IN ORDER

```powershell
git checkout dev
git pull origin dev
git checkout your-branch
git merge dev
# now work
git push origin your-branch
```

---

## COMMAND EXPLAINED

### `git checkout dev`
**What it does:** Switches you to the dev branch on your machine.

**When to use:** First thing every morning before you start working. You need to go to dev first to get the latest team code.

---

### `git pull origin dev`
**What it does:** Downloads the latest changes from GitHub's dev branch to your machine.

**When to use:** Right after switching to dev. This gets what your teammates pushed since yesterday.

---

### `git checkout your-branch`
**What it does:** Switches you back to your own personal branch.

**When to use:** After pulling dev. Go back to your branch before you start coding.

---

### `git merge dev`
**What it does:** Brings the latest team changes from dev INTO your branch.

**When to use:** Right after switching back to your branch. This keeps your branch up to date with the team and avoids conflicts later.

---

### `# now work`
Your normal coding time. Build your feature here.

---

### `git push origin your-branch`
**What it does:** Sends your work from your machine up to GitHub on your branch.

**When to use:** When you finish a feature OR at end of day even if not done.

---

## AFTER PUSHING — OPEN PULL REQUEST

1. Go to GitHub
2. Click **"Compare & pull request"**
3. Set base branch → **dev** (NOT main)
4. Write what you did
5. Ask teammate to review
6. Merge after review

---

## GOLDEN RULES

| Rule | Why |
|------|-----|
| Never push directly to main | Main must always be clean and working |
| Never push directly to dev | Always go through your branch → PR |
| Pull before you push. Always | Avoid conflicts |
| Commit small and often | Easy to track and fix mistakes |
| Stay in your module folder | Avoid touching teammates files |

---

## COMMIT MESSAGE FORMAT

```
git commit -m "module: what you did"
```

**Examples:**
```
git commit -m "auth: add google login endpoint"
git commit -m "quiz: fix MCQ generation prompt"
git commit -m "frontend: add flashcard flip animation"
git commit -m "rag: implement pgvector similarity search"
```

---

## WHO OWNS WHAT

| Person | Branch | Folder |
|--------|--------|--------|
| Person 1 | person1/auth | app/modules/auth |
| Person 2 | person2/rag | app/modules/rag + app/modules/upload |
| Person 3 | person3/quiz | app/modules/quiz + app/modules/assessment |
| Person 4 | person4/frontend-core | src/pages + src/components/dashboard + src/components/roadmap |
| Person 5 | person5/frontend-wow | src/components/quiz + src/components/flashcard + src/components/chatbot |

---

## IF YOU GET A CONFLICT

```powershell
# Git will tell you which file has conflict
# Open that file
# Look for this:
<<<<<<< your-branch
your code
=======
teammate code
>>>>>>> dev

# Keep what is correct, delete the markers
# Then:
git add .
git commit -m "fix: resolve merge conflict"
git push origin your-branch
```

---

> **One rule above all: Pull before you push. Always.** 🪨