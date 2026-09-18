# Satori Go - Technical Roadmap & Architecture Plan

**Date:** 2026  
**Status:** Planning Phase  
**Current Version:** Stable baseline with heuristic AI

---

## Executive Summary

This document outlines the technical roadmap for evolving Satori from a Go game with heuristic AI into an AI-powered Go learning and analysis platform. The plan integrates KataGo for engine-level analysis and Gemini for natural language coaching, while maintaining the existing stable baseline.

---

## 1. Current Architecture Assessment

### 1.1 Frontend (Current State)
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** React hooks (useGoGame)
- **AI System:** Heuristic-based with 5 difficulty levels
- **Deployment:** Vercel (static frontend)

### 1.2 Game Engine (Stable)
```
src/game/
├── types.ts          - Type definitions
├── board.ts          - Board operations
├── groups.ts         - Group detection (BFS)
├── capture.ts        - Capture logic
├── rules.ts          - Move validation
├── ko.ts             - Ko rule (simple ko)
├── scoring.ts        - Chinese scoring
├── ai.ts             - Heuristic AI (402 lines)
├── aiLevels.ts       - 5 difficulty configs
└── gameState.ts      - State management
```

### 1.3 AI Abstraction (Ready for Extension)
```
src/ai/
├── types.ts          - AIPlayer interface
├── HeuristicAI.ts    - Current implementation
├── factory.ts        - AI factory
├── GeminiCoach.ts    - Placeholder (no API calls)
└── index.ts          - Exports
```

### 1.4 Known Limitations
1. **Ko Rule:** Simple ko only (not positional superko)
2. **Dead Stones:** No automatic dead stone detection
3. **AI Strength:** Heuristic-based (not engine-level)
4. **No Backend:** Pure frontend application
5. **No SGF Support:** Cannot import/export games
6. **No Analysis:** No win rate, score estimate, or variations

---

## 2. Target Architecture

### 2.1 High-Level Design
```
┌─────────────────────────────────────────────────────────┐
│                    Satori Frontend                       │
│  (React + TypeScript + Tailwind)                        │
│  - Game UI                                              │
│  - Analysis Panel                                       │
│  - Coach Interface                                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ HTTPS API Calls
                 │
┌────────────────▼────────────────────────────────────────┐
│                 Satori Backend API                       │
│  (FastAPI + Python)                                     │
│  - REST endpoints                                       │
│  - WebSocket for real-time analysis                     │
│  - Authentication & rate limiting                       │
│  - Request routing                                      │
└────────┬─────────────────────────────────┬──────────────┘
         │                                 │
         │                                 │
┌────────▼────────┐              ┌─────────▼─────────┐
│   KataGo Engine │              │   Gemini API      │
│   (Go Analysis) │              │   (LLM Coaching)  │
│                 │              │                   │
│ - Best moves    │              │ - Explanations    │
│ - Win rates     │              │ - Strategy tips   │
│ - Variations    │              │ - Game reviews    │
│ - Score est.    │              │ - Move comments   │
└─────────────────┘              └───────────────────┘
```

### 2.2 Separation of Concerns

**KataGo Responsibilities:**
- Position evaluation (win rate, score)
- Best move calculation
- Variation generation
- Move quality assessment
- **NO** natural language generation
- **NO** user-facing explanations

**Gemini Responsibilities:**
- Explain KataGo analysis in natural language
- Provide strategic coaching
- Answer user questions
- Generate game reviews
- **NO** move legality validation
- **NO** position evaluation
- **NO** variation calculation

**Game Engine Responsibilities:**
- Move legality validation
- Board state management
- Capture detection
- Ko rule enforcement
- Scoring calculation
- **NO** AI decision making
- **NO** position evaluation

---

## 3. KataGo Integration Plan

### 3.1 KataGo Overview
KataGo is an open-source Go AI that provides:
- Superhuman playing strength
- Accurate position evaluation
- Win rate predictions
- Score estimates
- Principal variations
- Move policies

### 3.2 Deployment Options

#### Option A: Self-Hosted KataGo (Recommended for Development)
**Pros:**
- Full control over configuration
- No usage limits
- Can use GPU acceleration
- Free (open source)

**Cons:**
- Requires server infrastructure
- Needs GPU for reasonable performance
- Maintenance overhead

**Requirements:**
- Server with GPU (NVIDIA recommended) or high-end CPU
- 8GB+ RAM minimum
- 10GB+ storage for model files
- Python 3.8+ environment

#### Option B: KataGo Cloud API
**Pros:**
- No infrastructure management
- Scalable
- Easy to integrate

**Cons:**
- Usage costs
- Dependency on third-party service
- Potential rate limits

**Providers:**
- No official KataGo cloud API exists
- Could use services like:
  - Custom FastAPI backend with KataGo
  - Third-party Go analysis APIs (if available)

#### Option C: WebAssembly KataGo (Experimental)
**Pros:**
- Runs in browser
- No backend needed
- Low latency

**Cons:**
- Performance limitations
- Large download size (~50-100MB)
- Browser compatibility issues
- No GPU acceleration

**Verdict:** Not recommended for production

### 3.3 Recommended Architecture: FastAPI + KataGo

```
backend/
├── main.py              # FastAPI application
├── katago/
│   ├── engine.py        # KataGo wrapper
│   ├── config.py        # KataGo configuration
│   └── models/          # KataGo model files
├── gemini/
│   ├── client.py        # Gemini API client
│   └── prompts.py       # Prompt templates
├── api/
│   ├── routes/
│   │   ├── analysis.py  # Analysis endpoints
│   │   ├── coach.py     # Coaching endpoints
│   │   └── sgf.py       # SGF endpoints
│   └── models.py        # Request/response models
├── requirements.txt
└── Dockerfile
```

### 3.4 KataGo Integration Details

#### Installation
```bash
# Install KataGo
git clone https://github.com/lightvector/KataGo.git
cd KataGo/cpp

# Build with GPU support (CUDA)
cmake -DUSE_BACKEND=CUDA -DNVIDIA_GPU=1 ..
make -j$(nproc)

# Or CPU-only build
cmake -DUSE_BACKEND=NONE ..
make -j$(nproc)
```

#### Model Files
- **Binary model:** `b18c384nbt.bin.gz` (384 blocks, 18 channels)
- **Config file:** `gtp.cfg`
- Size: ~150MB download

#### Python Wrapper
```python
import subprocess
import json

class KataGoEngine:
    def __init__(self, model_path: str, config_path: str):
        self.process = subprocess.Popen(
            ['katago', 'gtp', '-model', model_path, '-config', config_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
    
    def analyze(self, sgf: str, moves_to_analyze: int = 1) -> dict:
        """Analyze position and return evaluation"""
        command = f"lz-analyze {moves_to_analyze}\n"
        self.process.stdin.write(command)
        self.process.stdin.flush()
        
        # Parse response
        response = self.process.stdout.readline()
        return self._parse_analysis(response)
    
    def get_best_move(self, sgf: str) -> dict:
        """Get best move with evaluation"""
        command = f"genmove_analyze\n"
        # ... implementation
```

#### API Endpoints
```python
POST /api/analysis/position
{
  "sgf": "...",
  "analyze_turns": 1,
  "include_variations": true
}
→ {
  "win_rate": 0.524,
  "score_estimate": 1.8,
  "best_move": "Q16",
  "variations": [...],
  "move_evaluations": {...}
}

POST /api/analysis/game
{
  "sgf": "...",
  "analyze_all_moves": true
}
→ {
  "move_analyses": [...],
  "mistakes": [...],
  "good_moves": [...]
}
```

### 3.5 Performance Considerations

**Analysis Time:**
- Single position: 1-5 seconds (GPU), 10-30 seconds (CPU)
- Full game (200 moves): 5-15 minutes (GPU), 1-2 hours (CPU)

**Optimization Strategies:**
1. **Batch Analysis:** Analyze multiple positions in parallel
2. **Caching:** Cache analysis results for common positions
3. **Progressive Analysis:** Start with fast analysis, refine later
4. **Selective Analysis:** Only analyze key moves (mistakes, critical positions)

**Resource Requirements:**
- **GPU:** NVIDIA RTX 3060 or better (recommended)
- **CPU:** 8+ cores for CPU-only mode
- **RAM:** 16GB minimum, 32GB recommended
- **Storage:** 20GB for KataGo + models

---

## 4. Gemini Integration Plan

### 4.1 Gemini Overview
Google's Gemini API provides:
- Natural language understanding
- Context-aware explanations
- Multi-turn conversations
- Structured output

### 4.2 Security Architecture

**CRITICAL:** API keys must NEVER be exposed in frontend code.

```
┌──────────────┐
│   Frontend   │
│  (React)     │
└──────┬───────┘
       │
       │ HTTPS (no API keys)
       │
┌──────▼───────┐
│   Backend    │
│  (FastAPI)   │
│              │
│  - Validates │
│    requests  │
│  - Adds API  │
│    keys      │
│  - Rate      │
│    limits    │
└──────┬───────┘
       │
       │ HTTPS (with API keys)
       │
┌──────▼───────┐
│ Gemini API   │
│              │
│ - Google AI  │
│   Studio     │
└──────────────┘
```

### 4.3 Backend Implementation

```python
# backend/gemini/client.py
import google.generativeai as genai
from typing import Optional

class GeminiClient:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def explain_move(
        self,
        position_sgf: str,
        move_played: str,
        katago_analysis: dict
    ) -> str:
        """Explain why a move was played"""
        prompt = self._build_move_explanation_prompt(
            position_sgf, move_played, katago_analysis
        )
        response = await self.model.generate_content_async(prompt)
        return response.text
    
    async def analyze_game(
        self,
        game_sgf: str,
        move_analyses: list[dict]
    ) -> dict:
        """Generate comprehensive game review"""
        prompt = self._build_game_review_prompt(game_sgf, move_analyses)
        response = await self.model.generate_content_async(prompt)
        return self._parse_game_review(response.text)
```

### 4.4 Prompt Engineering

#### Move Explanation Prompt
```python
def _build_move_explanation_prompt(
    self,
    position_sgf: str,
    move_played: str,
    katago_analysis: dict
) -> str:
    return f"""
You are a professional Go teacher explaining a move to a student.

Position (SGF format):
{position_sgf}

Move played: {move_played}

KataGo analysis:
- Win rate after move: {katago_analysis['win_rate']:.1%}
- Score estimate: {katago_analysis['score_estimate']:+.1f}
- Best move was: {katago_analysis['best_move']}
- Win rate for best move: {katago_analysis['best_win_rate']:.1%}

Explain this move in simple, encouraging language:
1. What was the strategic purpose?
2. How does it compare to the best move?
3. What should the player learn from this?

Keep explanation under 150 words.
"""
```

#### Game Review Prompt
```python
def _build_game_review_prompt(
    self,
    game_sgf: str,
    move_analyses: list[dict]
) -> str:
    mistakes = [m for m in move_analyses if m['quality'] == 'mistake']
    good_moves = [m for m in move_analyses if m['quality'] == 'good']
    
    return f"""
You are a professional Go teacher reviewing a student's game.

Game (SGF format):
{game_sgf}

Key moments:
- {len(mistakes)} mistakes identified
- {len(good_moves)} good moves identified

Mistakes:
{self._format_mistakes(mistakes)}

Good moves:
{self._format_good_moves(good_moves)}

Provide a comprehensive game review:
1. Overall assessment (strength level, style)
2. Opening analysis
3. Middle game highlights
4. Endgame evaluation
5. Top 3 areas for improvement
6. Encouraging conclusion

Be constructive and educational.
"""
```

### 4.5 API Endpoints

```python
POST /api/coach/explain-move
{
  "position_sgf": "...",
  "move_played": "Q16",
  "katago_analysis": {...}
}
→ {
  "explanation": "This move strengthens your position...",
  "key_points": [...]
}

POST /api/coach/review-game
{
  "game_sgf": "...",
  "move_analyses": [...]
}
→ {
  "summary": "...",
  "strengths": [...],
  "improvements": [...],
  "key_moments": [...]
}

POST /api/coach/ask-question
{
  "question": "Why is Q16 better than R14?",
  "context": {
    "position_sgf": "...",
    "katago_analysis": {...}
  }
}
→ {
  "answer": "..."
}
```

---

## 5. SGF Support Plan

### 5.1 SGF Overview
SGF (Smart Game Format) is the standard format for Go game records.

### 5.2 Implementation Strategy

**Frontend (Parsing & Generation):**
```typescript
// src/sgf/parser.ts
export function parseSGF(sgf: string): GameState {
  // Parse SGF string into game state
  // Validate moves through game engine
  // Return reconstructed game state
}

// src/sgf/generator.ts
export function generateSGF(gameState: GameState): string {
  // Convert game state to SGF format
  // Include metadata (player names, komi, etc.)
}
```

**Backend (Validation & Enhancement):**
```python
# backend/api/routes/sgf.py
@app.post("/api/sgf/validate")
async def validate_sgf(sgf: str) -> dict:
    """Validate SGF and return game info"""
    # Parse SGF
    # Validate all moves
    # Return game metadata
```

### 5.3 SGF Features

**Import:**
- Parse SGF string
- Reconstruct board positions
- Preserve move history
- Extract metadata (player names, rank, komi, result)
- Validate all moves through game engine

**Export:**
- Generate SGF from current game
- Include all metadata
- Support for variations (future)
- Support for comments (future)

### 5.4 UI Components

```typescript
// Import dialog
<SgfImportDialog
  onImport={(gameState) => {
    loadGame(gameState);
  }}
/>

// Export button
<button onClick={() => {
  const sgf = generateSGF(gameState);
  downloadFile(sgf, 'game.sgf');
}}>
  Export SGF
</button>
```

---

## 6. Analysis Mode Plan

### 6.1 Real-Time Analysis

**UI Components:**
```typescript
<AnalysisPanel>
  <WinRateGraph data={analysis.winRateHistory} />
  <ScoreEstimate value={analysis.scoreEstimate} />
  <BestMoves moves={analysis.candidateMoves} />
  <VariationTree variations={analysis.variations} />
</AnalysisPanel>
```

**Data Flow:**
```
User clicks position
  ↓
Frontend sends position to backend
  ↓
Backend calls KataGo
  ↓
KataGo returns analysis
  ↓
Backend returns to frontend
  ↓
Frontend displays analysis
```

### 6.2 Analysis Features

**Position Analysis:**
- Win rate (Black/White)
- Score estimate
- Top 3-5 candidate moves with win rates
- Principal variation (next 5-10 moves)
- Territory visualization

**Move Quality:**
- Excellent (win rate increase > 5%)
- Good (win rate increase 0-5%)
- Inaccuracy (win rate decrease 0-5%)
- Mistake (win rate decrease 5-10%)
- Blunder (win rate decrease > 10%)

### 6.3 Performance Optimization

**Debouncing:**
- Don't analyze on every mouse move
- Analyze after 500ms of inactivity

**Caching:**
- Cache analysis results for positions
- Invalidate cache when board changes

**Progressive Loading:**
- Show fast analysis first (1-2 seconds)
- Refine with deeper analysis in background

---

## 7. Variations Plan

### 7.1 Variation Display

**UI Components:**
```typescript
<VariationPlayer
  variation={analysis.principalVariation}
  onStepForward={() => {}}
  onStepBack={() => {}}
/>
```

**Features:**
- Step through variation moves
- Show win rate at each step
- Compare with actual game
- Branch variations (future)

### 7.2 Variation Data Structure

```typescript
interface Variation {
  moves: Position[];
  winRates: number[];
  scoreEstimates: number[];
  comments?: string[];
}
```

---

## 8. Game Review Plan

### 8.1 Review Workflow

```
Game ends
  ↓
User clicks "Analyze Game"
  ↓
Frontend sends SGF to backend
  ↓
Backend analyzes all moves with KataGo
  ↓
Backend identifies key moments
  ↓
Backend sends to Gemini for review
  ↓
Frontend displays review
```

### 8.2 Review Components

```typescript
<GameReview>
  <ReviewSummary summary={review.summary} />
  <MoveTimeline moves={review.moveAnalyses} />
  <KeyMoments moments={review.keyMoments} />
  <ImprovementAreas areas={review.improvements} />
</GameReview>
```

### 8.3 Move Classification

Based on KataGo win rate changes:
- **Excellent:** +5% or more
- **Good:** 0% to +5%
- **Inaccuracy:** 0% to -5%
- **Mistake:** -5% to -10%
- **Blunder:** -10% or more

---

## 9. Security Considerations

### 9.1 API Key Security

**NEVER expose in frontend:**
- KataGo credentials (if using cloud service)
- Gemini API key
- Any other secrets

**Always use backend proxy:**
```typescript
// ❌ BAD - Exposes API key
const response = await fetch('https://gemini.googleapis.com/...', {
  headers: { 'Authorization': 'Bearer API_KEY' }
});

// ✅ GOOD - Backend handles API key
const response = await fetch('/api/coach/explain', {
  method: 'POST',
  body: JSON.stringify({ position, move })
});
```

### 9.2 Rate Limiting

**Backend rate limits:**
- 10 requests/minute per user (free tier)
- 100 requests/minute per user (premium tier)
- Prevent abuse and control costs

### 9.3 Input Validation

**Validate all inputs:**
- SGF format validation
- Move legality validation
- Size limits on requests
- Sanitize user inputs

### 9.4 CORS Configuration

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://go-mind.vercel.app"],  # Production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 10. Deployment Architecture

### 10.1 Current Deployment
- **Frontend:** Vercel (static hosting)
- **Backend:** None (pure frontend)

### 10.2 Proposed Deployment

**Option A: Vercel + Railway (Recommended)**
```
Frontend: Vercel (free tier)
Backend: Railway ($5-20/month)
  - FastAPI
  - KataGo (CPU mode)
  - PostgreSQL (future)
```

**Option B: Vercel + Render**
```
Frontend: Vercel (free tier)
Backend: Render (free tier for web service)
  - FastAPI
  - KataGo (CPU mode)
```

**Option C: Full Vercel**
```
Frontend: Vercel
Backend: Vercel Serverless Functions
  - Limited by execution time (10s)
  - Not suitable for KataGo
```

**Option D: Self-Hosted**
```
Frontend: Vercel
Backend: VPS (DigitalOcean, Linode, etc.)
  - Full control
  - GPU support possible
  - $20-50/month
```

### 10.3 Recommended: Vercel + Railway

**Why Railway?**
- Easy deployment
- GPU support available
- Reasonable pricing
- Good documentation
- Docker support

**Architecture:**
```
Vercel (Frontend)
  ↓ HTTPS
Railway (Backend)
  ├── FastAPI
  ├── KataGo (CPU/GPU)
  └── Redis (caching)
```

---

## 11. Implementation Phases

### Phase 1: Product Polish (1-2 weeks)
**Priority:** High  
**Risk:** Low  
**Impact:** Medium

**Tasks:**
- [ ] Improve AI status UX
- [ ] Enhance hint UX
- [ ] Polish move review UX
- [ ] Mobile responsiveness improvements
- [ ] Accessibility audit
- [ ] Error handling improvements

**Deliverables:**
- Polished UI/UX
- Better error messages
- Improved mobile experience

### Phase 2: SGF Support (1-2 weeks)
**Priority:** High  
**Risk:** Low  
**Impact:** High

**Tasks:**
- [ ] SGF parser (frontend)
- [ ] SGF generator (frontend)
- [ ] Import dialog UI
- [ ] Export functionality
- [ ] Tests for SGF parsing

**Deliverables:**
- Import/export SGF files
- Preserve game history
- Metadata support

### Phase 3: Backend Infrastructure (2-3 weeks)
**Priority:** High  
**Risk:** Medium  
**Impact:** High

**Tasks:**
- [ ] Set up FastAPI backend
- [ ] Deploy to Railway
- [ ] Configure CORS
- [ ] Set up environment variables
- [ ] Basic API endpoints
- [ ] Health checks

**Deliverables:**
- Running backend API
- Secure deployment
- Monitoring setup

### Phase 4: KataGo Integration (3-4 weeks)
**Priority:** High  
**Risk:** High  
**Impact:** Very High

**Tasks:**
- [ ] Install KataGo on backend
- [ ] Python wrapper for KataGo
- [ ] Analysis API endpoints
- [ ] Position analysis
- [ ] Move evaluation
- [ ] Variation generation
- [ ] Performance optimization
- [ ] Caching layer

**Deliverables:**
- Real-time position analysis
- Win rate predictions
- Best move suggestions
- Move quality assessment

### Phase 5: Analysis Mode UI (2-3 weeks)
**Priority:** Medium  
**Risk:** Low  
**Impact:** High

**Tasks:**
- [ ] Analysis panel component
- [ ] Win rate graph
- [ ] Score estimate display
- [ ] Candidate moves list
- [ ] Variation player
- [ ] Real-time updates

**Deliverables:**
- Interactive analysis interface
- Visual feedback
- Smooth UX

### Phase 6: Game Review (2-3 weeks)
**Priority:** Medium  
**Risk:** Medium  
**Impact:** High

**Tasks:**
- [ ] Full game analysis
- [ ] Move classification
- [ ] Key moment detection
- [ ] Review UI
- [ ] Move timeline
- [ ] Statistics dashboard

**Deliverables:**
- Comprehensive game reviews
- Move-by-move analysis
- Performance insights

### Phase 7: Gemini Integration (2-3 weeks)
**Priority:** Medium  
**Risk:** Medium  
**Impact:** High

**Tasks:**
- [ ] Gemini API client
- [ ] Prompt engineering
- [ ] Move explanation endpoint
- [ ] Game review endpoint
- [ ] Q&A endpoint
- [ ] Coach UI panel
- [ ] Conversation interface

**Deliverables:**
- Natural language explanations
- Strategic coaching
- Interactive Q&A

### Phase 8: Advanced Features (Ongoing)
**Priority:** Low  
**Risk:** Medium  
**Impact:** Medium

**Tasks:**
- [ ] Positional superko
- [ ] Dead stone detection
- [ ] Pattern recognition
- [ ] Opening database
- [ ] Endgame trainer
- [ ] Tsumego problems

---

## 12. Risk Assessment

### 12.1 Technical Risks

**Risk 1: KataGo Performance**
- **Impact:** High
- **Probability:** Medium
- **Mitigation:** 
  - Use GPU if budget allows
  - Implement caching
  - Optimize analysis requests
  - Provide CPU fallback

**Risk 2: API Costs**
- **Impact:** Medium
- **Probability:** Medium
- **Mitigation:**
  - Implement rate limiting
  - Cache analysis results
  - Use free tiers where possible
  - Monitor usage

**Risk 3: Deployment Complexity**
- **Impact:** Medium
- **Probability:** Low
- **Mitigation:**
  - Start with simple deployment
  - Document setup process
  - Use Docker for consistency
  - Implement health checks

### 12.2 Business Risks

**Risk 1: User Adoption**
- **Impact:** High
- **Probability:** Low
- **Mitigation:**
  - Focus on UX polish
  - Provide tutorials
  - Gather user feedback
  - Iterate based on feedback

**Risk 2: Competition**
- **Impact:** Medium
- **Probability:** Medium
- **Mitigation:**
  - Focus on unique features
  - Emphasize UX quality
  - Build community
  - Continuous improvement

---

## 13. Success Metrics

### 13.1 Technical Metrics
- API response time < 2 seconds
- 99.9% uptime
- < 1% error rate
- Page load time < 3 seconds

### 13.2 User Metrics
- Daily active users
- Games played per day
- Analysis requests per day
- User retention rate
- Feature adoption rate

### 13.3 Business Metrics
- Monthly active users
- Conversion rate (if monetized)
- User satisfaction score
- Support ticket volume

---

## 14. Budget Estimation

### 14.1 Development Costs
- **Phase 1-2:** 2-4 weeks (existing team)
- **Phase 3-4:** 5-7 weeks (existing team)
- **Phase 5-8:** 8-12 weeks (existing team)
- **Total:** 15-23 weeks

### 14.2 Infrastructure Costs (Monthly)

**Minimal Setup:**
- Vercel: $0 (free tier)
- Railway: $5-10 (basic plan)
- Gemini API: $0-10 (free tier + pay-as-you-go)
- **Total:** $5-20/month

**Recommended Setup:**
- Vercel: $20 (pro tier)
- Railway: $20-40 (with GPU)
- Gemini API: $20-50 (moderate usage)
- **Total:** $60-110/month

**Production Setup:**
- Vercel: $20 (pro tier)
- Railway: $50-100 (GPU + scaling)
- Gemini API: $50-200 (high usage)
- Redis: $10-20
- **Total:** $130-340/month

### 14.3 One-Time Costs
- KataGo model files: $0 (open source)
- Domain name: $10-15/year
- SSL certificate: $0 (Let's Encrypt)

---

## 15. Timeline

### 15.1 Conservative Timeline
- **Phase 1-2:** 4 weeks
- **Phase 3-4:** 7 weeks
- **Phase 5-6:** 6 weeks
- **Phase 7-8:** 6 weeks
- **Total:** 23 weeks (~6 months)

### 15.2 Aggressive Timeline
- **Phase 1-2:** 2 weeks
- **Phase 3-4:** 5 weeks
- **Phase 5-6:** 4 weeks
- **Phase 7-8:** 4 weeks
- **Total:** 15 weeks (~4 months)

### 15.3 Milestones
- **Month 1:** SGF support + Backend setup
- **Month 2:** KataGo integration
- **Month 3:** Analysis mode + Game review
- **Month 4:** Gemini coaching + Polish

---

## 16. Next Steps

### Immediate Actions (This Week)
1. **Review and approve this technical plan**
2. **Set up development environment**
   - Install KataGo locally for testing
   - Set up FastAPI project structure
   - Configure Railway account
3. **Begin Phase 1: Product Polish**
   - Focus on UX improvements
   - Fix any remaining bugs
   - Improve mobile experience

### Short-term Goals (Next 2 Weeks)
1. **Complete Phase 1: Product Polish**
2. **Start Phase 2: SGF Support**
   - Implement SGF parser
   - Implement SGF generator
   - Add import/export UI

### Medium-term Goals (Next 2 Months)
1. **Complete Phase 2: SGF Support**
2. **Complete Phase 3: Backend Infrastructure**
3. **Start Phase 4: KataGo Integration**
   - Basic position analysis
   - Move evaluation

---

## 17. Conclusion

This technical plan provides a comprehensive roadmap for evolving Satori from a Go game with heuristic AI into a full-featured AI-powered Go learning platform. The architecture is designed to be:

- **Scalable:** Can handle growth in users and features
- **Maintainable:** Clean separation of concerns
- **Secure:** API keys protected, input validation
- **Cost-effective:** Start small, scale as needed
- **User-friendly:** Focus on UX and accessibility

The phased approach allows for incremental delivery of value while managing risk and complexity. Each phase builds on the previous one, ensuring a stable foundation for future features.

**Key Success Factors:**
1. Start with solid foundation (Phases 1-3)
2. Prioritize KataGo integration (Phase 4)
3. Focus on UX throughout
4. Monitor costs and performance
5. Gather user feedback and iterate

**Recommended Starting Point:**
Begin with Phase 1 (Product Polish) and Phase 2 (SGF Support) to establish a solid foundation before tackling the more complex KataGo and Gemini integrations.

---

## Appendix A: Technology Stack Summary

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router

### Backend (New)
- FastAPI (Python)
- KataGo (Go engine)
- Gemini API (LLM)
- PostgreSQL (future)
- Redis (caching)

### Infrastructure
- Vercel (frontend)
- Railway (backend)
- GitHub (source control)

### Development Tools
- VS Code
- Git
- Docker (optional)
- Postman (API testing)

---

## Appendix B: API Reference (Draft)

### Analysis Endpoints

```
POST /api/analysis/position
POST /api/analysis/game
GET  /api/analysis/status/{task_id}
```

### Coach Endpoints

```
POST /api/coach/explain-move
POST /api/coach/review-game
POST /api/coach/ask-question
```

### SGF Endpoints

```
POST /api/sgf/parse
POST /api/sgf/generate
POST /api/sgf/validate
```

---

## Appendix C: KataGo Configuration

### Recommended Settings

```ini
# gtp.cfg
maxVisits = 100
numSearchThreads = 8
ponderingEnabled = false
lagBuffer = 100
```

### Performance Tuning

**For CPU:**
- maxVisits: 50-100
- numSearchThreads: 4-8

**For GPU:**
- maxVisits: 200-500
- numSearchThreads: 1-2

---

**Document Version:** 1.0  
**Last Updated:** 2026  
**Author:** Satori Development Team
