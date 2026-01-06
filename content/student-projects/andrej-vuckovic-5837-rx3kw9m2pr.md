# Project Grading - Relationship Tree

**Student**: Andrej Vuckovic (5837)  
**Project**: Relationship Tree  
**Course**: Internet Programming (Frontend Development)  
**Date**: January 3, 2026

---

## Final Grade: 82/100 (A / 9) - Creative Angular Project! 🎨

---

## Overall Assessment

Your Relationship Tree is a **creative and well-executed Angular project** with interesting canvas visualization and interactive features. The fractal tree that grows with relationship duration is genuinely creative, and your use of Angular CDK drag & drop shows good technical skills.

**What you built well:**
- ⭐ Canvas-based fractal tree visualization
- ⭐ Angular CDK drag & drop (milestones + characters)
- ⭐ **Proper observable cleanup** (OnDestroy implemented)
- ⭐ BehaviorSubject for state management
- ⭐ Seasonal animations (falling particles)
- ⭐ Creative concept

**What limits the grade:**
- ⚠️ Limited scope (personal relationship tracker)
- ⚠️ No HTTP integration (localStorage only)
- ⚠️ No forms (just alerts/prompts)
- ⚠️ Only 2 routes

---

## What Makes This Creative

### 1. Fractal Tree Visualization ⭐⭐

You implemented a canvas-based fractal tree that grows based on relationship duration. This is genuinely creative!

**Technical skills demonstrated:**
- HTML5 Canvas API
- Fractal algorithms
- Animation with RequestAnimationFrame
- Dynamic rendering based on state

### 2. Angular CDK Drag & Drop ⭐⭐

```typescript
handleMilestoneDragEnd(event: CdkDragEnd, milestoneId: string) {
  const position = event.source.getFreeDragPosition();
  // Collision detection logic
  milestone.position = proposedPosition;
  this.saveMilestones();
}
```

**Advanced Angular CDK usage:**
- Free-form dragging
- Collision detection
- Position persistence

### 3. Proper Observable Cleanup ⭐⭐

```typescript
ngOnDestroy(): void {
  this.timerSubscription?.unsubscribe();
  this.dateSubscription?.unsubscribe();
}
```

**You got this right!** Many students miss observable cleanup. Well done.

### 4. BehaviorSubject Patterns ⭐

```typescript
private startDateSubject = new BehaviorSubject<Date>(this.startDate);
public startDate$: Observable<Date> = this.startDateSubject.asObservable();
```

**Professional reactive state management.**

### 5. Seasonal Features ⭐

Particles fall in summer/fall seasons. Shows attention to detail and polish.

---

## What Limits the Grade

### 1. No HTTP Integration

Everything uses localStorage:
```typescript
localStorage.setItem(this.STORAGE_KEY, this.startDate.getTime().toString());
localStorage.setItem('milestones', JSON.stringify(this.milestones));
```

**No HTTP calls anywhere** (no fetch, no HttpClient).

**For "Internet Programming"**, HTTP integration is expected.

### 2. Very Limited Scope

This is a **personal relationship tracker** for one specific use case.

Other students built:
- Team/player management systems
- Lesson management platforms
- Basketball statistics browsers

**Your project is creative but narrow in scope.**

### 3. No Forms

You use alerts and prompts instead of proper forms:
```typescript
if (!this.newMilestoneName.trim()) {
  alert('Please enter a milestone name');
  return;
}
```

**Expected**: Angular reactive forms with validation.

### 4. Only 2 Routes

- `/tree` - Tree view
- `/roadmap` - Roadmap view

**Expected**: 5+ routes with parameters, guards, etc.

---

## Scoring Breakdown

1. **Application Runs**: 18/20 - Works well
2. **Design/UX**: 15/20 - Functional but basic CSS
3. **Models**: 10/15 - Limited data structures
4. **Routing**: 25/40 - Only 2 routes, no guards/params
5. **Components**: 55/80 - Good but limited variety
6. **Services**: 15/35 - BehaviorSubject good, no HTTP
7. **Forms**: 0/40 - No forms (uses alerts)
8. **Observables**: 20/35 - Good cleanup, no HTTP
9. **Technical Challenge**: 25/50 - Creative but narrow scope

**Final: 82/100**

---

## How This Compares

**Top Projects:**
1. Barbara (148/100) - A+ Angular with HTTP
2. Angela (142/100) - A+ Angular with complete CRUD + HTTP
3. Andrej S. (98/100) - A React with modern stack (no HTTP)
4. Teona (98/100) - A Angular (no cleanup)
5. **Your project (82/100)** - A Angular (creative but narrow)

**What separates you:**
- Others have HTTP integration
- Others have broader scope
- Others have forms

**What makes yours unique:**
- Most creative visualization!
- Canvas fractal tree (no one else did this)
- Proper observable cleanup (better than some higher scores)

---

## What You Proved

Despite the limitations, you demonstrated:

- ✅ Canvas API skills (fractal tree)
- ✅ Angular CDK knowledge (drag & drop)
- ✅ Observable patterns (BehaviorSubject)
- ✅ **Proper cleanup** (ngOnDestroy)
- ✅ Creativity and personal investment
- ✅ TypeScript with interfaces

**These are valuable skills!**

---

## How to Improve to A+ (95-100)

### 1. Add HTTP Integration

**Use json-server** for a backend:
```bash
npm install -D json-server
```

Create `db.json`:
```json
{
  "relationships": [...],
  "milestones": [...],
  "notes": [...]
}
```

Replace localStorage with HttpClient:
```typescript
getMilestones(): Observable<Milestone[]> {
  return this.http.get<Milestone[]>('http://localhost:3001/milestones');
}
```

### 2. Expand Scope

Make it **multi-user**:
- User accounts
- Multiple relationships per user
- Shared roadmaps
- Social features

### 3. Add Proper Forms

```typescript
milestoneForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  emoji: ['📍', Validators.required],
  date: ['', Validators.required]
});
```

### 4. More Routes

- `/login` - User authentication
- `/relationships` - List all relationships
- `/relationships/:id` - Specific relationship
- `/relationships/:id/milestones` - Milestone list
- `/profile` - User profile

**With these changes: 82/100 → 95-100/100**

---

## The Personal Project Question

This feels like a **passion project** - something you built for personal use that happens to use Angular.

**That's actually great!** Personal projects show:
- Real motivation
- Creative thinking
- Going beyond requirements

**But for a course assignment**, we expect:
- Broader application scope
- Demonstrating full stack (HTTP integration)
- Multiple features
- General-purpose application

**Your project is too specific** (tracks one relationship with specific hardcoded features).

---

## Final Thoughts

Andrej, your **fractal tree visualization is the most creative** in the cohort. The canvas work and Angular CDK drag & drop show technical depth. Your observable cleanup is better than some higher-scored projects.

**The grade limitations come from:**
- Very narrow scope (personal tracker)
- No HTTP layer
- No forms
- Limited routes

**This is good technical work on a creative idea**, but it's held back by being a personal project rather than a general-purpose application.

**Your grade of 82/100 (A / 9)** reflects:
- Creative execution
- Good Angular patterns
- Limited scope and features
- Missing HTTP requirement

**If you expand this into a multi-user platform with HTTP integration, it could easily be A+ work!**

---

**Nice creative work! Consider expanding the scope for a higher grade.** 🎨🌳
