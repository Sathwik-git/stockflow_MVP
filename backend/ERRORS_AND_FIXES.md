# StockFlow Backend — Errors Encountered & How They Were Fixed

## 1. `prisma.config.ts` outside `rootDir` (TS6059)

**Error**

```
error TS6059: File 'prisma.config.ts' is not under 'rootDir' 'src'.
'rootDir' is expected to contain all source files.
```

**Cause**  
`tsconfig.json` set `rootDir` to `./src`, but the default TypeScript glob (`**/*`) also picked up `prisma.config.ts` that lives at the project root.

**Fix**  
Added an `exclude` array to `tsconfig.json` so TypeScript ignores the file:

```json
"exclude": ["prisma.config.ts", "node_modules", "dist"]
```

---

## 2. Prisma `$transaction` callback loses model getters (TS2339)

**Error**

```
error TS2339: Property 'organisation' does not exist on type
  'Omit<PrismaClient<...>, runtime.ITXClientDenyList>'
error TS2339: Property 'user' does not exist on type
  'Omit<PrismaClient<...>, runtime.ITXClientDenyList>'
```

**Cause**  
Prisma v7 types the interactive-transaction client as `Omit<PrismaClient, ITXClientDenyList>`. Because the model accessors (`user`, `organisation`, etc.) are implemented as **getters** on the class, the `Omit<>` utility type strips them from the type surface — even though they exist at runtime.

**Fix**  
Cast the transaction client to `typeof prisma` inside the callback:

```ts
const { user, organisation } = await prisma.$transaction(async (tx) => {
  const t = tx as unknown as typeof prisma; // Prisma v7: getters stripped by Omit<>
  const organisation = await t.organisation.create({ ... });
  const user = await t.user.create({ ... });
  return { user, organisation };
});
```

---

## 3. Express 5 route params typed as `string | string[]` (TS2322)

**Error**

```
error TS2322: Type 'string | string[]' is not assignable to type
  'string | StringFilter<"Product"> | undefined'.
  Type 'string[]' is not assignable to type ...
```

**Cause**  
Express 5 changed `req.params` values from `string` to `string | string[]`. Prisma `where` fields only accept `string`, so the assignment failed type-checking.

**Fix**  
Explicitly coerce every `req.params.id` to `string`:

```ts
const id = String(req.params.id);
```

---

## 4. Implicit `any` on `Array.reduce` / `.filter` / `.map` callbacks (TS7006)

**Error**

```
error TS7006: Parameter 'sum' implicitly has an 'any' type.
error TS7006: Parameter 'p' implicitly has an 'any' type.
```

**Cause**  
`prisma.product.findMany()` and `prisma.organisation.findUnique()` returned via `Promise.all` — TypeScript couldn't infer the array element type because the outer destructure was untyped, causing all callback parameters to fall back to `any` (strict mode rejects this).

**Fix**  
Imported the generated `Organisation` and `Product` types and explicitly annotated the destructured tuple:

```ts
import type { Organisation, Product } from "../generated/prisma/client";

const [org, products]: [Organisation | null, Product[]] = await Promise.all([
  prisma.organisation.findUnique({ where: { id: organisationId } }),
  prisma.product.findMany({ where: { organisation_id: organisationId } }),
]);
```

Also added a type annotation on the `reduce` accumulator as a secondary guard:

```ts
products.reduce((sum: number, p) => sum + p.quantity, 0);
```

---

## 5. `typeof org` self-reference cycle (TS7022)

**Error**

```
error TS7022: 'org' implicitly has type 'any' because it does not have a
type annotation and is referenced directly or indirectly in its own initializer.
```

**Cause**  
An intermediate attempt used `[typeof org, Product[]]` as the tuple type annotation. TypeScript cannot resolve `typeof org` at the point where `org` is itself being declared — creating a circular inference.

**Fix**  
Replaced `typeof org` with the concrete type `Organisation | null` (see fix #4 above).
