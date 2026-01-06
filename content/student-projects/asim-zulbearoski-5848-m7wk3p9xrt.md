# Project Evaluation - Asim Zulbearoski (5848)

**Project**: eph-chat (Ephemeral Chat)  
**Course**: Internet Programming (Frontend Development)  
**Date**: January 4, 2026

---

## 📊 Final Grade: **75/100 (B / 8)**

---

## 🌟 Project Highlights

Good work on building a functional chat application with real backend integration! Your honest self-assessment in the README was refreshing and shows maturity as a developer.

### What You Did Well:

**1. Real Full-Stack Integration** ⭐
You built a complete Spring Boot backend with proper REST API endpoints. This is significantly more impressive than using json-server - you have real JPA entities, repositories, and a proper service layer.

**2. Clean TypeScript Interfaces** ⭐
```typescript
export interface ChatRoom {
  id: number;
  name: string;
  description: string;
  users: User[];
  messages: Message[];
  createdAt: Date;
}
```
Your models properly represent the relationships between users, chat rooms, and messages.

**3. BehaviorSubject for State Management** ⭐
```typescript
private userSubject = new BehaviorSubject<User | null>(null);
user$ = this.userSubject.asObservable();
```
This is a proper reactive pattern for sharing user state across components. Well done!

**4. Route Parameters**
You correctly used route parameters for chat room navigation:
```typescript
{ path: 'chat-room/:id', component: ChatRoomComponent }
```
And properly extracted them in the component.

**5. Honest Documentation**
Your README honestly acknowledged the WebSocket pivot. In professional development, knowing your limitations and delivering working alternatives is valuable.

**6. Error Handling**
Your UsersService has proper error handling with `catchError` - this is often overlooked.

---

## 📈 Score Breakdown

| Category | Score | Notes |
|----------|-------|-------|
| Application Runs/Builds | 18/20 | Works with both servers |
| Design/UX | 14/20 | Nice animations, consistent styling |
| Models/Data Structures | 15/15 | Perfect TypeScript |
| Routing | 35/40 | Good use of route params |
| Components | 55/80 | Functional but missing patterns |
| Services | 28/35 | Well-organized, good error handling |
| Forms | 15/40 | Template-driven only |
| Async/Observables | 20/35 | BehaviorSubject good, cleanup missing |
| Technical Challenge | 30/50 | Real backend, multi-user chat |

**Total: 230/335 → Scaled: 75/100**

---

## 🔧 Areas for Improvement

### 1. Observable Cleanup (Critical!)

**Current Issue**: Your subscriptions never get cleaned up:

```typescript
// Current code - creates memory leaks
ngOnInit(): void {
  this.userService.user$.subscribe(user => {
    this.route.params.subscribe(params => {
      // These subscriptions live forever!
    });
  });
}
```

**Solution**: Add cleanup with `takeUntil`:

```typescript
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class ChatRoomComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.userService.user$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      // Now properly cleaned up
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

### 2. Avoid Nested Subscriptions

**Current Issue**:
```typescript
this.userService.user$.subscribe(user => {
  this.route.params.subscribe(params => {
    // Nested - anti-pattern
  });
});
```

**Better Approach** - Use `combineLatest`:
```typescript
import { combineLatest } from 'rxjs';

combineLatest([
  this.userService.user$,
  this.route.params
]).pipe(
  takeUntil(this.destroy$)
).subscribe(([user, params]) => {
  if (user) {
    this.currentUser = user;
    this.roomId = +params['id'];
    this.loadChatRoom(this.roomId);
  }
});
```

---

### 3. Add provideHttpClient() to Config

**Current approach** (older pattern):
```typescript
// In each component
imports: [HttpClientModule, ...]
```

**Better approach** (modern Angular):
```typescript
// app.config.ts
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()  // Add this!
  ]
};
```

Then remove `HttpClientModule` from component imports.

---

### 4. Consider Reactive Forms

For better validation and form control:

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class UserCreationComponent {
  userForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  get usernameErrors() {
    return this.userForm.get('username')?.errors;
  }
}
```

---

### 5. Add Route Guards

Protect your chat routes from unauthenticated users:

```typescript
// auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  
  return userService.user$.pipe(
    map(user => user ? true : router.createUrlTree(['/user-creation']))
  );
};

// app.routes.ts
{ path: 'chat-rooms', component: ChatRoomsListComponent, canActivate: [authGuard] }
```

---

## ✨ What Made This a Good Project

1. **Real Backend**: Spring Boot with JPA is production-level architecture
2. **Proper Models**: TypeScript interfaces match backend entities
3. **Reactive State**: BehaviorSubject shows RxJS understanding
4. **Working Features**: Chat rooms, messages, user management all work
5. **Honest Documentation**: Acknowledging limitations professionally

---

## 📚 Recommended Learning

To improve your Angular skills further:

1. **RxJS Operators**
   - Learn `combineLatest`, `switchMap`, `mergeMap`
   - Practice the `takeUntil` cleanup pattern
   - Resource: [Learn RxJS](https://www.learnrxjs.io/)

2. **Reactive Forms**
   - FormBuilder, FormGroup, custom validators
   - Resource: [Angular Reactive Forms Guide](https://angular.dev/guide/forms/reactive-forms)

3. **WebSocket Integration** (for your original goal)
   - Angular + Socket.io or native WebSocket
   - Consider: `@stomp/ng2-stompjs` for Spring WebSocket

4. **Route Guards**
   - Functional guards in Angular 15+
   - Protect routes based on auth state

---

## 🎯 Summary

You've built a functional chat application with real full-stack integration. The backend work is solid, and your frontend correctly communicates with it. The main gaps are in Angular-specific patterns (observable cleanup, reactive forms, route guards).

Your honest acknowledgment of the WebSocket limitation shows good professional judgment - delivering a working product is better than an ambitious failure.

**Grade: B (75/100)** - Solid work with room to grow into an A by mastering RxJS lifecycle patterns.

---

*If you have questions about this evaluation or want to discuss improvements, feel free to reach out during office hours.*
