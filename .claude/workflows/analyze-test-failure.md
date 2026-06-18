# Analyze Test Failure & Suggest Fixes

## Purpose
Analyze a failing Dependabot PR to understand breaking changes and suggest specific code fixes.

## When This Runs
- When a Dependabot PR fails tests (usually major version updates)
- Triggered by `.github/workflows/analyze-breaking-changes.yml`
- Posted as comment on the failing PR

## Your Task

1. **Understand the Failure**
   - What tests are failing?
   - What error messages do they show?
   - Is it an API change, breaking change, or compatibility issue?

2. **Research the Breaking Changes**
   - Fetch the package changelog between versions (provided in PR)
   - Identify what changed:
     - Function signatures?
     - Export structure?
     - Configuration format?
     - Removed APIs?
   - Note which changes affect the failing tests

3. **Locate Affected Code**
   - Search the repository for usage of the changed API
   - Find all files that import or use the package
   - Map which files need updates

4. **Suggest Specific Fixes**
   - For each breaking change:
     - Show the old code pattern
     - Show the new code pattern required
     - Explain why it changed
   - Provide concrete code examples with diff format

5. **Format the Output**
   
   Post as GitHub comment:
   ```
   ## 🔧 Suggested Fixes for [package] v[old] → v[new]

   ### Breaking Change 1: [Change Description]
   - **Impact**: [Which tests/features fail]
   - **Affected Files**: [List files]
   - **Why Changed**: [Explanation from changelog]

   **Suggested Fix:**
   ~~~diff
   - OLD_CODE_HERE
   + NEW_CODE_HERE
   ~~~

   **Location**: `path/to/file.js:line-number`
   **Test Impact**: Fixes test name "should X"

   ---

   ### Breaking Change 2: [Next change...]
   ```

6. **Prioritize by Impact**
   - Start with most-used files
   - Show high-impact changes first
   - Group related changes together

## Example Scenario

**Package**: axios 0.x → 1.x
**Failing Test**: "POST request should work"
**Error**: "axios.post is not a function"

**Research Finding**: axios 1.x changed from named exports to default export

**Your Output**:
```
## 🔧 Suggested Fixes for axios 0.x → 1.x

### Breaking Change 1: Import statement changed from named exports to default export

- **Impact**: All axios usage breaks
- **Affected Files**: 8 files
- **Why Changed**: Simplified to align with ES module standards

**Suggested Fix:**
~~~diff
- import { get, post } from 'axios';
+ import axios from 'axios';

- post('/api/data')
+ axios.post('/api/data')
~~~

**Files to Update**:
1. `packages/api/src/services/requests.ts`
2. `packages/core/src/utils/http.js`
3. ... (7 more files)
```

## Do's and Don'ts

### Do ✅
- Be specific with file paths and line numbers
- Provide exact before/after code
- Explain the "why" from the changelog
- Group related changes
- Suggest one fix per change
- Format code blocks properly

### Don't ❌
- Say "manually fix it" - provide exact fixes
- Skip the changelog research
- Make assumptions - verify actual changes
- Suggest unrelated refactoring
- Leave ambiguous recommendations

## Resources

- Package changelog (provided in PR body)
- GitHub issue comments with error logs
- Repository code search (available)
- NPM package documentation (as fallback)

---

**Success**: Developer can copy-paste your suggestions and have tests pass.
