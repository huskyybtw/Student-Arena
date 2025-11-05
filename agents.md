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

### Reusable UI Components

**Global Components** (located in `@/components/ui/`):

- **SearchBar**: Debounced search input with icon support
- **TabSwitcher**: Generic tab switching component with type safety
- **Pagination**: Global pagination component for all lists/tables
- **Skeleton**: Loading state placeholders
- **RoleSelector**: League of Legends role selection
- **ConfirmationDialog**: Reusable confirmation dialogs for destructive actions

**Pagination Component Usage:**

```typescript
import { Pagination } from "@/components/ui/pagination";

<Pagination
  currentPage={currentPage}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
/>;
```

**SearchBar Component Usage:**

```typescript
import { SearchBar } from "@/components/ui/search-bar";
import { Search } from "lucide-react";

<SearchBar
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Szukaj..."
  icon={<Search className="h-4 w-4" />}
  debounce={300}
/>;
```

### Styling Guidelines

**Card Backgrounds:**

- Use **solid backgrounds** (`bg-card`) instead of transparent ones (`bg-card/80`)
- Transparent backgrounds make buttons and text hard to see
- Use `border-border` for proper border visibility

**Button Variants:**

- Use existing button variants from the design system
- `variant="default"` - Primary actions (e.g., "Aplikuj", "Stwórz")
- `variant="secondary"` - Secondary actions (e.g., "Zarządzaj", "Filtry", "Edytuj", "Usuń")
- `variant="outline"` - Tertiary actions or cancel buttons
- Avoid custom hover classes - use built-in variant hover states
- **Consistency**: Action buttons in the same context should use the same variant and size for visual harmony

**UI Component Visibility (Concise UI Principle):**

- Input fields and select components should NOT blend with the background
- Use `bg-card/50` for inputs and selects to ensure visibility against page backgrounds
- Standard styling for inputs: `bg-card/50 border-border`
- Standard styling for selects: `bg-card/50` with `dark:hover:bg-card/70`
- Avoid overly transparent backgrounds (`bg-transparent`, `dark:bg-input/30`) that make components hard to see
- Keep UI clean and concise but ensure all interactive elements are clearly visible

**Example:**

```typescript
// Card with solid background
<Card className="bg-card border-border hover:border-primary/50 transition-all">

// Buttons using existing variants
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Cancel</Button>

// Input with proper visibility
<Input className="bg-card/50 border-border" />

// Select with proper visibility (already applied in select.tsx component)
```

### Type Generation

- Run `npm run orval` after any backend DTO changes
- Generated types are in `src/lib/api/model/`
- Do NOT manually edit generated files
- Use generated enums instead of hardcoding values

### Backend Search Implementation

**Requirements:**

- Implement server-side search filtering for better performance
- Use Prisma `where` clauses with `OR` conditions for multi-field search
- Always use case-insensitive matching with `mode: 'insensitive'`
- Use `contains` for partial matching

**Example:**

```typescript
import { Prisma } from '@prisma/client';

async findMany(params: QueryParams) {
  const where: Prisma.PlayerPostingWhereInput = {};

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
      { player: { gameName: { contains: params.search, mode: 'insensitive' } } },
      { player: { tagLine: { contains: params.search, mode: 'insensitive' } } },
    ];
  }

  return await this.prisma.playerPosting.findMany({
    where,
    skip: (params.page - 1) * params.limit,
    take: params.limit,
    orderBy: { [String(params.sortBy || 'createdAt')]: params.sortOrder || 'desc' },
    include: { player: true },
  });
}
```

**Frontend Integration:**

- Always pass search parameter (even empty string) to ensure query refetch
- Don't use conditional parameters with `undefined` - this breaks React Query caching

```typescript
// ✅ CORRECT
const { data } = useQuery({ search: searchTerm });

// ❌ WRONG - breaks refetch on search clear
const { data } = useQuery(searchTerm ? { search: searchTerm } : undefined);
```

### CRUD Patterns

**Unified Dialog Components:**

- Prefer unified components with type props over separate components for similar functionality
- Reduces code duplication and maintenance burden
- Use conditional rendering based on type parameter

**Example:**

```typescript
interface EditPostingDialogProps {
  type: "team" | "player";
  postingId: number;
  // ... other props
}

export function EditPostingDialog({ type, ...props }: EditPostingDialogProps) {
  // Type-based conditional logic
  if (type === "team") {
    updateTeamMutation.mutate(data);
  } else {
    updatePlayerMutation.mutate(data);
  }
}
```

**Confirmation Dialogs:**

- Create reusable confirmation dialogs for destructive actions
- Support customizable title, description, buttons, and variants
- Always use for delete operations

**Query Invalidation:**

- Invalidate related queries after mutations to refresh data
- Add to mutation's `onSuccess` callback

```typescript
const mutation = useMutation({
  mutation: {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postingsList"] });
      toast.success("Operation successful");
    },
  },
});
```

### Table/List Layout Guidelines

**Column Alignment:**

- **Text content columns**: Left-aligned (natural reading flow)
- **Action buttons column**: Center-aligned for visual balance
- **Date columns**: Left-aligned to match headers
- Use Tailwind utilities: `text-center` on header, `justify-center` on flex container

**Action Buttons:**

- Show edit/delete buttons only for items owned by current user
- For items not owned, show appropriate interaction buttons (e.g., "Zaproś", "Aplikuj")
- Use same styling for all action buttons in a table (variant, size, gap)

**Ownership Checking:**

- Player postings: Check `user?.playerAccount?.id === post.playerId`
- Team postings: Fetch user's teams and check `myTeams.some(team => team.id === post.teamId)`

**Example:**

```typescript
// Fetch user's teams for ownership check
const { data: myTeamsData } = useTeamControllerTeams(
  user?.playerAccount?.id ? { members: [user.playerAccount.id] } : undefined
);
const myTeams = myTeamsData?.data || [];

// Check ownership
const isMyTeamPosting = myTeams.some((team) => team.id === post.team.id);

// Render appropriate buttons
<div className="col-span-3 flex items-center justify-center gap-2">
  {isMyTeamPosting ? (
    <>
      <EditPostingDialog type="team" {...editProps} />
      <DeletePostingDialog type="team" {...deleteProps} />
    </>
  ) : (
    <Button variant="default">Apply</Button>
  )}
</div>;
```
