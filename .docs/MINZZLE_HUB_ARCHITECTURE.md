# Minzzle Hub Architecture — Gameplay Paradigms & Serving Model

Version: 2.0  
Purpose: Restructure platform architecture to correctly support different puzzle types.

---

# 1. Core Insight

Minzzle Hub contains **two fundamentally different gameplay paradigms**:

## A. Level-Based Puzzles (Finite Content)
- Example: Minzzle Fives
- Predefined boards
- Solved once → player progresses
- Difficulty is curated
- Player expectation: “next level”

## B. Generative System Puzzles (Infinite Content)
- Examples: Minzzle Swipes, Minzzle Swipes Hex
- Same board reused
- Puzzle defined by scramble
- Infinite replayability
- Difficulty defined by parameters
- Player expectation: “one more solve”

---

# 2. Key Rule (Non-Negotiable)

Do NOT force a single “levels” abstraction across all games.

- Fives MUST remain level-based
- Swipes MUST be generative

---

# 3. Platform Structure

Minzzle Hub = container of heterogeneous puzzle systems

Minzzle Hub
 ├── Minzzle Fives       (Level-based)
 ├── Minzzle Swipes      (Generative)
 └── Minzzle Swipes Hex  (Generative)

---

# 4. Serving Model

## 4.1 Level-Based Serving (Fives)

- Levels are stored
- Retrieved via API
- Sequential progression

User flow:
- Open game
- Choose level
- Solve → next level

---

## 4.2 Generative Serving (Swipes / Hex)

- No predefined levels required
- Puzzle is generated on demand

User flow:
- Choose configuration (size + difficulty)
- Generate puzzle
- Solve
- Repeat

---

# 5. Replacement for “Levels” in Generative Games

Replace concept of “levelId” with:

Puzzle Configuration

Includes:
- Board size
- Difficulty
- Optional seed

---

# 6. Puzzle Session Abstraction (Unified Layer)

All games should load via a unified session model:

PuzzleSession =
  LevelSession
  OR
  GeneratedSession

---

# 7. API Model

## Level-Based API (Fives)
- list levels
- load level

## Generative API (Swipes / Hex)
- generate puzzle from parameters

---

# 8. Difficulty Model

Fives:
- curated levels

Swipes / Hex:
- based on scramble depth

---

# 9. Scramble Rule

Always:
1. Start from solved state
2. Apply valid transformations
3. Produce scrambled board

---

# 10. UX Separation

Fives:
- level map
- progression

Swipes:
- config panel
- infinite replay

---

# 11. UX Unification

Keep consistent:
- visuals
- animations
- controls
- layout

---

# 12. Final Principle

Minzzle is a brand, not a single gameplay model.

Different puzzle types must coexist but remain structurally independent.
