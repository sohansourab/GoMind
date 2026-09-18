# Local Testing & GitHub Deployment Guide

This guide walks you through extracting the tar file, testing locally, and pushing to GitHub.

---

## 📦 Step 1: Extract the Tar File

Open your terminal and navigate to where your tar file is located:

```bash
# Navigate to the directory containing the tar file
cd /path/to/your/tar/file

# Extract the tar file
tar -xzf satori-go-game.tar.gz

# Navigate into the extracted directory
cd satori-go-game
```

**Verify extraction:**
```bash
ls
```

You should see:
```
node_modules/  (if included)
src/
package.json
README.md
.gitignore
... (other files)
```

---

## 🔧 Step 2: Install Dependencies

If `node_modules/` was NOT included in the tar file:

```bash
npm install
```

This will install all required packages based on `package.json`.

**Verify installation:**
```bash
ls node_modules
```

You should see many packages like `react`, `typescript`, `vite`, etc.

---

## 🧪 Step 3: Test Locally

### 3.1 Run the Development Server

```bash
npm run dev
```

You should see output like:
```
  VITE v6.3.5  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 3.2 Open in Browser

Open your browser and navigate to:
```
http://localhost:3000
```

### 3.3 Test the Application

**Test Checklist:**

✅ **Basic Gameplay**
- [ ] Click "New Game"
- [ ] Select board size (9×9)
- [ ] Select "Human vs Human"
- [ ] Click "Start Game"
- [ ] Place stones by clicking intersections
- [ ] Verify stones alternate black/white
- [ ] Verify last move indicator shows

✅ **Capture Mechanics**
- [ ] Surround a stone to capture it
- [ ] Verify captured stones disappear
- [ ] Check capture count updates

✅ **Pass & Resign**
- [ ] Click "Pass" button
- [ ] Verify turn switches
- [ ] Click "Resign" button
- [ ] Verify game over dialog appears

✅ **AI Mode**
- [ ] Start new game
- [ ] Select "Human vs Computer"
- [ ] Select difficulty (Easy/Medium/Hard)
- [ ] Make a move
- [ ] Verify AI responds after thinking delay
- [ ] Verify "Thinking..." indicator shows

✅ **Review Mode**
- [ ] Play several moves
- [ ] Click "Previous" to go back
- [ ] Click "Next" to go forward
- [ ] Click on move history items
- [ ] Verify board updates correctly

✅ **Responsive Design**
- [ ] Resize browser window
- [ ] Test on mobile (if possible)
- [ ] Verify board scales properly
- [ ] Verify modal is scrollable on small screens

✅ **Rulebook**
- [ ] Click "Rules" button
- [ ] Expand/collapse sections
- [ ] Verify all rules display correctly

✅ **New Game Dialog**
- [ ] Open New Game dialog
- [ ] Select different board sizes
- [ ] Select different player modes
- [ ] Select different AI difficulties
- [ ] Adjust komi
- [ ] Verify "Start Game" button is reachable (scroll if needed)

### 3.4 Run Automated Tests

```bash
npm test
```

You should see output like:
```
✓ src/tests/board.test.ts (10 tests)
✓ src/tests/groups.test.ts (8 tests)
✓ src/tests/capture.test.ts (6 tests)
...

Test Files  10 passed (10)
     Tests  50+ passed (50+)
```

All tests should pass ✅

### 3.5 Stop the Dev Server

Press `Ctrl+C` in the terminal to stop the development server.

---

## 🏗️ Step 4: Build for Production (Optional)

Test the production build:

```bash
# Create production build
npm run build

# Preview the production build
npm run preview
```

Open the URL shown (usually `http://localhost:4173`) and verify everything works.

Press `Ctrl+C` to stop the preview server.

---

## 📝 Step 5: Prepare for GitHub

### 5.1 Check .gitignore

Verify `.gitignore` exists and contains:

```bash
cat .gitignore
```

Should include:
```
node_modules/
dist/
build/
.env
.env.local
.DS_Store
*.log
```

### 5.2 Initialize Git Repository

```bash
git init
```

### 5.3 Add All Files

```bash
git add .
```

### 5.4 Check What Will Be Committed

```bash
git status
```

**Important**: Verify that `node_modules/` is NOT listed. It should be ignored.

You should see files like:
```
new file:   .gitignore
new file:   README.md
new file:   package.json
new file:   src/App.tsx
new file:   src/game/board.ts
...
```

**NOT** `node_modules/` files!

### 5.5 Create First Commit

```bash
git commit -m "Initial commit: Satori Go Game

- Complete Go game implementation
- Human vs Human and Human vs AI modes
- 9x9, 13x13, 19x19 board sizes
- AI with 3 difficulty levels
- Full Go rules: capture, ko, suicide prevention
- Chinese area scoring
- Responsive design with dark theme
- Comprehensive test suite
- Production-ready build"
```

---

## 🚀 Step 6: Push to GitHub

### 6.1 Create GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. Enter repository name: `satori-go-game` (or your preferred name)
3. Add description (optional): "A premium web-based Go game with AI"
4. **DO NOT** initialize with README, .gitignore, or license (we already have them)
5. Click "Create repository"

### 6.2 Connect Local Repository to GitHub

Copy the commands GitHub shows you, or use these (replace `YOUR_USERNAME`):

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/satori-go-game.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**Authentication**: 
- If using HTTPS: GitHub will prompt for credentials
- If using SSH: Make sure your SSH key is added to GitHub

### 6.3 Verify on GitHub

1. Go to your repository on GitHub
2. Refresh the page
3. You should see all your files
4. README.md should be displayed on the main page

---

## 🌐 Step 7: Host the Application (Later)

When you're ready to host, here are the easiest options:

### Option 1: Vercel (Recommended - Easiest)

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "Add New Project"
4. Import your `satori-go-game` repository
5. Vercel auto-detects Vite configuration
6. Click "Deploy"
7. Done! You'll get a URL like `satori-go-game.vercel.app`

**Every git push will auto-deploy!**

### Option 2: Netlify

1. Go to [https://netlify.com](https://netlify.com)
2. Sign up/Login with GitHub
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Option 3: GitHub Pages

1. Install gh-pages:
   ```bash
   npm install -D gh-pages
   ```

2. Add to `package.json` scripts:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. Add to `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/satori-go-game/',
     // ... rest of config
   })
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

5. Your site will be at: `https://YOUR_USERNAME.github.io/satori-go-game/`

### Option 4: Cloudflare Pages

1. Go to [https://pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect your GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy

---

## 🔄 Step 8: Making Updates (Future)

When you make changes to the code:

```bash
# 1. Make your changes

# 2. Test locally
npm run dev

# 3. Run tests
npm test

# 4. Stage changes
git add .

# 5. Commit with descriptive message
git commit -m "Add feature: AI move explanations"

# 6. Push to GitHub
git push

# 7. If using Vercel/Netlify, it auto-deploys!
```

---

## 🐛 Troubleshooting

### Issue: `npm install` fails

**Solution**: 
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Port 3000 already in use

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- --port 3001
```

### Issue: Tests fail

**Solution**:
```bash
# Clear test cache
npm test -- --no-cache

# Run specific test file
npm test src/tests/board.test.ts
```

### Issue: Git push authentication fails

**Solution**:
- For HTTPS: Use a Personal Access Token instead of password
  - GitHub → Settings → Developer settings → Personal access tokens → Generate new token
- For SSH: Make sure your SSH key is added to GitHub
  - `ssh-keygen -t ed25519 -C "your_email@example.com"`
  - Add `~/.ssh/id_ed25519.pub` to GitHub SSH keys

### Issue: Build fails

**Solution**:
```bash
# Check for TypeScript errors
npm run typecheck

# Check for linting errors (if configured)
npm run lint

# Clear build cache
rm -rf dist
npm run build
```

---

## ✅ Quick Reference Commands

```bash
# Extract tar
tar -xzf satori-go-game.tar.gz

# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview

# Git commands
git init
git add .
git commit -m "message"
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main

# Future updates
git add .
git commit -m "message"
git push
```

---

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [GitHub Docs](https://docs.github.com/)
- [Vercel Documentation](https://vercel.com/docs)

---

**Need help?** Check the README.md in the project root for more information about the game itself.

Good luck! 🎮
