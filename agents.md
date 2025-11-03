# Project Guidelines

## Backend (NestJS)

### DTO Guidelines

#### Swagger/OpenAPI Decorators

**1. Response DTOs (data from database):**

For nullable fields (fields with `?` in Prisma schema like `gameName String?`):

```typescript
import { ApiProperty } from "@nestjs/swagger";

export class PlayerResponseDto {
  @ApiProperty({
    example: "Husky",
    description: "Riot Games Player GameName",
    type: String,
    nullable: true,
  })
  gameName?: string | null;

  @ApiProperty({
    example: LeagueRole.TOP,
    description: "primary role declared by player",
    enum: LeagueRole,
    nullable: true,
  })
  primaryRole?: LeagueRole | null;
}
```

**Rules:**

- Always add `type: String/Number/Boolean` for primitive nullable types
- Always add `nullable: true` for fields that can be null
- For enums, add `enum: EnumType` AND `nullable: true`
- TypeScript type should be `field?: Type | null`

**2. Request DTOs (input from users):**

For optional fields that users can omit:

```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateDto {
  @ApiProperty({
    example: "Required field",
    description: "This field is required",
  })
  @IsString()
  @IsNotEmpty()
  requiredField: string;

  @ApiPropertyOptional({
    example: "Optional field",
    description: "This field can be omitted",
    type: String,
  })
  @IsString()
  @IsOptional()
  optionalField?: string;
}
```

**Rules:**

- Use `@ApiPropertyOptional` for optional input fields
- Still add `type: String/Number/Boolean` for clarity
- Add `@IsOptional()` validation decorator
- TypeScript type should be `field?: Type` (no null)

**3. Enums:**

Always use this format for enum fields:

```typescript
@ApiProperty({
  example: PostingStatus.OPEN,
  description: 'Current status of the posting',
  enum: PostingStatus,
})
status: PostingStatus;
```

**Rules:**

- Always add `enum: EnumType` property
- Do NOT add `enumName` property (Orval handles it automatically)
- For nullable enums, add `nullable: true`
- For optional enum inputs, use `@ApiPropertyOptional` with `enum: EnumType`

#### Summary Table

| Scenario                | Decorator              | Properties                         | TypeScript Type            |
| ----------------------- | ---------------------- | ---------------------------------- | -------------------------- |
| Nullable response field | `@ApiProperty`         | `type: String`, `nullable: true`   | `field?: string \| null`   |
| Nullable enum response  | `@ApiProperty`         | `enum: EnumType`, `nullable: true` | `field?: EnumType \| null` |
| Optional input field    | `@ApiPropertyOptional` | `type: String`                     | `field?: string`           |
| Optional enum input     | `@ApiPropertyOptional` | `enum: EnumType`                   | `field?: EnumType`         |
| Required field          | `@ApiProperty`         | `type: String`                     | `field: string`            |
| Required enum           | `@ApiProperty`         | `enum: EnumType`                   | `field: EnumType`          |

### Error Handling

All service methods that call external APIs must wrap calls in try-catch blocks and throw appropriate HTTP exceptions:

```typescript
try {
  const response = await this.httpService.get(url).toPromise();
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    throw new HttpException(
      error.response?.data?.message || "External API error",
      error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
  throw new HttpException(
    "Internal server error",
    HttpStatus.INTERNAL_SERVER_ERROR
  );
}
```

### Testing

- Use `--runInBand` flag for all test scripts to prevent parallel execution issues
- Tests should be placed in `test/` subdirectories within each module
- Factory pattern should be used for test data generation
- Target: 80%+ code coverage

## Frontend (Next.js)

### Form Handling

**Requirements:**

- All forms must use **Yup** for validation
- All validators must be placed in `src/lib/validators/` directory
- All forms must use **react-hook-form** with `useForm` hook
- Validators should be separated by feature/domain (e.g., `authSchema.ts`, `profileSchema.ts`, `gameInfoSchema.ts`)

**Example Structure:**

```typescript
// src/lib/validators/profileSchema.ts
import * as yup from "yup";

export const profileSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  currentPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters"),
  newPassword: yup.string().min(6, "Password must be at least 6 characters"),
});

export type ProfileFormData = yup.InferType<typeof profileSchema>;
```

**Usage in Components:**

```typescript
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { profileSchema, ProfileFormData } from "@/lib/validators/profileSchema";

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<ProfileFormData>({
  resolver: yupResolver(profileSchema),
});
```

**Using Generated Enums:**

Import enums from Orval-generated types and use them in validators:

```typescript
import { PlayerResponseDtoPrimaryRole } from "@/lib/api/model/playerResponseDtoPrimaryRole";

const roles = Object.values(PlayerResponseDtoPrimaryRole);

export const gameInfoSchema = yup.object({
  primaryRole: yup.string().oneOf(roles).optional(),
});
```

### Data Fetching

- Use auth provider's `useCurrentUser()` hook for user data
- Fetch data once in page components and pass as props to child components
- Avoid fetching same data multiple times in different components
- Benefits: Single API call, consistent loading state, better performance

**Example:**

```typescript
// In page component
export default function SettingsPage() {
  const { user, isLoading } = useCurrentUser();

  return (
    <>
      <ProfileCard loading={isLoading} user={user} />
      <GameInfoCard loading={isLoading} user={user} />
    </>
  );
}
```

### Loading States

- Always use **Skeleton** components from `@/components/ui/skeleton` for loading states
- Skeletons should match the dimensions and layout of the actual content
- Never use plain text like "Loading..." or spinners for data fetching components

**Example:**

```typescript
import { Skeleton } from "@/components/ui/skeleton";

// For input fields
{
  isLoading ? (
    <Skeleton className="h-11 w-full rounded-xl" />
  ) : (
    <Input {...props} />
  );
}

// For cards or complex layouts
{
  isLoading ? (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <Skeleton className="h-6 w-3/4 mt-4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardContent>
    </Card>
  ) : (
    <Card>{/* Actual content */}</Card>
  );
}
```

### Styling Guidelines

**Card Backgrounds:**

- Use **solid backgrounds** (`bg-card`) instead of transparent ones (`bg-card/80`)
- Transparent backgrounds make buttons and text hard to see
- Use `border-border` for proper border visibility

**Button Variants:**

- Use existing button variants from the design system
- `variant="default"` - Primary actions (e.g., "Aplikuj", "Stwórz")
- `variant="secondary"` - Secondary actions (e.g., "Zarządzaj", "Filtry")
- `variant="outline"` - Tertiary actions or cancel buttons
- Avoid custom hover classes - use built-in variant hover states

**Example:**

```typescript
// Card with solid background
<Card className="bg-card border-border hover:border-primary/50 transition-all">

// Buttons using existing variants
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Cancel</Button>
```

### Type Generation

- Run `npm run orval` after any backend DTO changes
- Generated types are in `src/lib/api/model/`
- Do NOT manually edit generated files
- Use generated enums instead of hardcoding values
