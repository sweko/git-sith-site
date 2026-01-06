# Project Evaluation - Borjan Ladinski (5885)

**Project**: EverBloom - Flower Shop  
**Course**: Internet Programming (Frontend Development)  
**Date**: January 4, 2026

---

## 📊 Final Grade: **76/100 (B / 8)**

---

## 🌟 Project Highlights

You've built a flower shop website with Angular 21 and Django backend integration. The visual design is professional and the basic functionality works.

### What You Did Well:

**1. Real Backend Integration** ⭐
Your proxy configuration for Django shows understanding of full-stack development:
```json
{
  "/api": {
    "target": "http://127.0.0.1:8000",
    "secure": false,
    "changeOrigin": true
  }
}
```

**2. TypeScript Interfaces**
You defined proper interfaces for your data:
```typescript
export interface Flower {
  id: number;
  name: string;
  price: number;
  image_url: string;
  // ...
}
```

**3. Search and Filter Functionality**
Your catalog filtering works well:
```typescript
get filteredFlowers(): Flower[] {
  return this.flowers.filter(flower => {
    const matchesCategory = this.selectedCategory === 'all' || flower.category === this.selectedCategory;
    const matchesSearch = flower.name.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });
}
```

**4. Modern Angular Configuration**
Good use of `provideHttpClient()` in app config - this is the correct modern pattern.

**5. Contact Form with Error Handling**
Your contact form handles both success and error states:
```typescript
this.contactService.submitContactMessage(formData).subscribe({
  next: (response) => { this.submitSuccess = true; },
  error: (err) => { this.submitError = 'Failed to submit message.'; }
});
```

---

## 📈 Score Breakdown

| Category | Score | Notes |
|----------|-------|-------|
| Application Runs/Builds | 17/20 | Works with Django backend |
| Design/UX | 16/20 | Professional Bootstrap theme |
| Models/Data Structures | 12/15 | Good interfaces |
| Routing | 25/40 | Missing wildcard route |
| Components | 40/80 | Basic structure, minimal depth |
| Services | 25/35 | Clean service pattern |
| Forms | 18/40 | Template-driven only |
| Async/Observables | 10/35 | No cleanup patterns |
| Technical Challenge | 20/50 | Search/filter, contact form |

**Total: 183/335 → Scaled: 68/100**

---

## 🔧 Areas for Improvement

### 1. Add Observable Cleanup (Critical!)

**Current Issue**: Your subscriptions never get cleaned up:

```typescript
// Current - memory leak
ngOnInit(): void {
  this.loadFlowers();
}
```

**Solution**: Add cleanup with `takeUntil`:

```typescript
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class CatalogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.flowerService.getFlowers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.flowers = items.map(/* ... */);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

### 2. Use Route Parameter Observable (Not Snapshot)

**Current Issue**: Using snapshot won't react to parameter changes:

```typescript
// Current - anti-pattern
const id = Number(this.route.snapshot.paramMap.get('id'));
```

**Better Approach**:
```typescript
import { switchMap } from 'rxjs/operators';

ngOnInit(): void {
  this.route.params.pipe(
    takeUntil(this.destroy$),
    switchMap(params => {
      const id = Number(params['id']);
      return this.flowerService.getFlower(id);
    })
  ).subscribe({
    next: (flower) => this.flower = flower,
    error: (err) => console.error('Error loading flower:', err)
  });
}
```

---

### 3. Add a Wildcard Route

**Current Issue**: Invalid URLs don't redirect:

```typescript
// Current routes - no 404 handling
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'catalog', component: CatalogComponent },
  // Missing wildcard!
];
```

**Fix**:
```typescript
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'flower/:id', component: ProductDetailComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '' }  // Add this!
];
```

---

### 4. Add Error Handling to Catalog

**Current Issue**: No error handling when flowers fail to load:

```typescript
// Current
loadFlowers(): void {
  this.flowerService.getFlowers().subscribe((items) => {
    this.flowers = items.map(/* ... */);
    // What if this fails?
  });
}
```

**Better**:
```typescript
loadFlowers(): void {
  this.isLoading = true;
  this.error = null;
  
  this.flowerService.getFlowers().pipe(
    takeUntil(this.destroy$)
  ).subscribe({
    next: (items) => {
      this.flowers = items.map(/* ... */);
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Error loading flowers:', err);
      this.error = 'Failed to load flowers. Please try again.';
      this.isLoading = false;
    }
  });
}
```

---

### 5. Consider Reactive Forms for Contact

For better validation control:

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class ContactComponent implements OnInit {
  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.contactService.submitContactMessage(this.contactForm.value).subscribe(/* ... */);
    }
  }
}
```

---

### 6. Type Your Category Properly

**Current**: `category: any`

**Better**:
```typescript
export interface Category {
  id: number;
  name: string;
}

export interface Flower {
  id: number;
  name: string;
  category: Category | null;
  // ...
}
```

---

## ✨ What Could Make This Project Stronger

1. **Shopping Cart**: Add cart functionality with a service using BehaviorSubject
2. **User Authentication**: Login/register with Django JWT
3. **Order History**: Allow users to view past orders
4. **Admin Panel**: CRUD operations for flowers
5. **Image Upload**: Allow adding new flowers with images

---

## 📚 Recommended Learning

1. **RxJS Lifecycle Management**
   - Learn `takeUntil`, `async` pipe patterns
   - Resource: [RxJS Documentation](https://rxjs.dev/guide/overview)

2. **Reactive Forms**
   - FormBuilder, custom validators
   - Resource: [Angular Reactive Forms Guide](https://angular.dev/guide/forms/reactive-forms)

3. **Route Guards**
   - Protect routes based on authentication
   - Resource: [Angular Route Guards](https://angular.dev/guide/routing/route-guards)

---

## 🎯 Summary

Your project demonstrates basic Angular and Django integration with a professional visual theme. The search/filter functionality and contact form work well.

**To improve to a B grade**, focus on:
1. Adding observable cleanup (ngOnDestroy)
2. Using route parameter observables
3. Adding error handling throughout
4. Implementing more interactive features

The core Angular patterns need strengthening, particularly around RxJS lifecycle management.

**Grade: B (76/100)** - Solid work with room for improvement in Angular-specific patterns.

---

*If you have questions about this evaluation, feel free to reach out during office hours.*
