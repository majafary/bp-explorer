# Enterprise Architecture Viewer - AI Governance

**Purpose**: Ensure bulletproof data integrity and professional execution as the application scales

## Core Principle: Value-First Thinking

**Every AI action must serve application quality. Avoid meta-work.**

✅ **DO**: Validate data integrity, ensure referential consistency, improve application quality
❌ **DON'T**: Track AI performance, create metrics dashboards, measure AI effectiveness

**Focus**: Make the application bulletproof, not track how well you're doing it

---

## Core Principle: Big Picture Awareness

**Always keep the system's TRUE PURPOSE in mind. Don't let examples dictate architecture.**

### The Big Picture

**This is**: An Enterprise Architecture Modeling System for managing **10+ blueprints** across organizational boundaries
**This is NOT**: A CIAM-specific tool (CIAM is ONE example blueprint)

**All Blueprints**: CIAM, API Platform, C3, Conversational AI, Customer Communications, Deposits Fraud, Deposits Platform, Intelligent Automation, Money Movement, Personalization (and growing)

### Before Any Design Decision

**Ask These Questions**:

```
[ ] What is the CORE PURPOSE of this system?
    → Multi-blueprint enterprise architecture modeling (not CIAM-specific)

[ ] Am I designing for the example or the general case?
    → Always design for the general case (N blueprints)

[ ] Will this decision scale to blueprint #2, #3, #10?
    → If naming after CIAM, answer is NO

[ ] Does this name/design reflect the true scope?
    → "ciam-viewer" ❌ vs "ea-viewer" or "blueprint-viewer" ✅

[ ] What would a seasoned enterprise architect choose?
    → Generic, purpose-driven, scalable names
```

### Naming Discipline

**Rule**: When building systems for multiple X, NEVER name it after one specific X

**Examples**:

- ❌ "ciam-viewer" - Specific to one blueprint, breaks when adding API Platform
- ❌ "ciam-capabilities.json" - Should be "{blueprint}-capabilities.json" pattern
- ✅ "blueprint-viewer" or "ea-viewer" - General purpose, scales to N blueprints
- ✅ "Enterprise Architecture Viewer" - Reflects true scope

### Design Thinking

**General Case First**:

1. Start with the general architecture (N blueprints)
2. Use CIAM as an example to validate
3. Don't let the example dictate the design

**Scale Thinking**:

- How does this work with 20 blueprints?
- What if each blueprint has different schemas?
- Is this tool-agnostic (per SRS requirement)?

**Purpose Anchoring**:

- Re-read SRS Section 1.1 "Project Vision" before major decisions
- Remember: "Tool-agnostic enterprise architecture modeling system"
- Keep the matrix relationship in mind: Blueprints × LOBs × Systems × Applications

---

## Data Model Overview

### Files and Relationships

```
Blueprint (bp-ciam) in blueprints.json
    ↓ blueprintId reference
Capabilities (L1 → L2 → L3) in ciam-capabilities.json
    ↓ systemIds[] references
Systems/Containers in ciam-systems.json
    ↓ Powers
UI Navigation: Capability → "View in C4" → System/Container
```

### Critical Constraint

**ALL capability systemIds MUST reference valid entities in ciam-systems.json**

- Breaking this breaks the "View in C4" navigation feature
- Invalid references cause runtime errors

---

## Automatic Behaviors (MANDATORY)

### 1. Always Read Complete Model First

**Trigger**: ANY request involving data model changes

**Required Actions**:

```
1. Read ALL three files:
   - src/data/blueprints.json
   - src/data/ciam-capabilities.json
   - src/data/ciam-systems.json

2. Parse and understand current structure

3. Map dependencies:
   - Which capabilities reference which systems?
   - What's the hierarchy structure?
   - What patterns exist (IDs, codes, naming)?
```

**No Exceptions**: Never propose changes without reading the complete model first

---

### 2. Validate Referential Integrity

**Always Check**:

- ✅ Every systemId exists in ciam-systems.json (systems or containers)
- ✅ blueprintId matches blueprints.json
- ✅ Parent capabilities exist (for Level 2-3)
- ✅ No duplicate IDs across entire model
- ✅ Hierarchy levels correct (L1 → L2 → L3, max depth 3)

**Validation Points**:

- **Before proposing**: Validate all new references
- **During execution**: Check each systemId as adding
- **After changes**: Run full integrity validation

---

### 3. Present Comprehensive Proposals

**Required Format**:

```markdown
## Proposed Changes Analysis

### Files Affected

- [x] src/data/ciam-capabilities.json
- [ ] src/data/ciam-systems.json
- [ ] src/data/blueprints.json

### Changes to ciam-capabilities.json

[Exact changes with line numbers or hierarchy location]

### systemIds References

- cap-ciam-XXX-X-X → systemIds: ["sys-ciam-backend", "sys-ldap"]
- Validation: ✅ All exist in systems.json

### Validation Checks

✅ All systemIds exist
✅ Hierarchy maintained (L1→L2→L3)
✅ IDs unique
✅ Code patterns followed
✅ blueprintId consistent

### Impact Analysis

- UI: [Where new capabilities appear]
- Navigation: [How "View in C4" will work]
- Risk: [Any concerns]

Approve? (yes/no)
```

**Be Concise**: No verbose meta-commentary. Clear, actionable proposal only.

---

### 4. Wait for Explicit Approval

**Required Approval Keywords**: "yes", "approve", "proceed", "confirm", "go ahead"

**Never Proceed With**: "I think so", "maybe", "probably"

**If Rejected**: Stop, ask what needs adjustment, revise proposal

---

### 5. Execute with Inline Validation

**During File Edits**:

```
FOR each new capability:
  IF capability has systemIds:
    FOR each systemId:
      VERIFY systemId exists in systems.json
      IF NOT exists:
        ABORT with error
        REPORT which systemId is invalid
```

**Fail Fast**: Stop immediately on any integrity violation

---

### 6. Verify After Changes

**Post-Change Verification** (automatic):

```
1. Re-read modified files
2. Validate JSON syntax
3. Run: npm run validate-data
4. Verify TypeScript build: npm run build
5. Report results
```

**Verification Report Format**:

```markdown
## Verification Report

✅ JSON Syntax Valid
✅ Reference Integrity: All systemIds validated
✅ TypeScript Build: Success
✅ Hierarchy Structure: Maintained

Changes Applied:

- Added 3 capabilities to CIAM Operations (006-2)
- systemIds: 2 unique systems referenced
- Navigation: "View in C4" tested for all new capabilities

Status: ✅ VERIFIED
```

---

## Data Integrity Rules

### Referential Integrity (SACROSANCT)

- Every systemId in capabilities MUST exist in systems
- Every blueprintId MUST exist in blueprints
- Zero orphaned references tolerated
- Validate before commit, verify after commit

### Hierarchy Integrity

```yaml
level_1:
  - Has children array
  - NO systemIds
  - code: "XXX" (3 digits)
  - id: "cap-{blueprint}-{code}"

level_2:
  - Has children array
  - NO systemIds
  - code: "XXX-X" (parent code + 1 digit)
  - id: "cap-{blueprint}-{code}"

level_3:
  - Has systemIds array (required)
  - NO children
  - code: "XXX-X-X" (parent code + 1 digit)
  - id: "cap-{blueprint}-{code}"
```

### ID Pattern Compliance

```yaml
blueprints: "bp-{name}"
capabilities: "cap-{blueprint}-{code}"
systems: "sys-{name}"
containers: "cont-{name}"
components: "comp-{name}"
```

**Validation**: All new IDs must match established patterns

---

## Professional Execution Standards

### Think Like a Data Architect

**Systematic Approach**:

```
1. Understand Intent
   - Ask clarifying questions if ambiguous
   - Confirm which blueprint, level, parent

2. Read Complete Model
   - All 3 data files
   - Understand relationships

3. Analyze Impact
   - Which files change?
   - Which relationships affected?
   - What could break?

4. Design Solution
   - Maintain integrity
   - Follow patterns
   - Validate references

5. Present Proposal
   - Complete analysis
   - Clear validation results
   - Concise communication

6. Execute with Validation
   - Inline integrity checks
   - Fail fast on violations

7. Verify Results
   - Full validation suite
   - Confirm functionality preserved
```

### Communication Style

**Professional**:

- Use precise terminology: "referential integrity", not "links work"
- Reference exact IDs: "cap-ciam-001-2-3", not "the device capability"
- Be concise: Clear proposals, not verbose process narration

**Avoid**:

- Meta-commentary: Don't explain your thinking process
- Verbose status updates: Don't narrate every action
- Over-explaining: Present results, not how you got there

---

## Focus Discipline

### Stay On Task

**Core Focus**:

- Data model integrity
- Application functionality
- Code quality
- User value delivery

**Avoid Tangents**:

- AI performance analysis
- Meta-work tracking
- Verbose self-reflection
- Unnecessary explanations

**Efficient Workflow**:

1. Read (quietly)
2. Analyze (internally)
3. Present (concisely)
4. Execute (efficiently after approval)
5. Verify (thoroughly)
6. Done. Next task.

### Token Efficiency

**Think Wisely**:

- Understand completely before proposing
- One comprehensive analysis, not multiple iterations

**Deliver Concisely**:

- Clear proposals with essential information
- Skip verbose process descriptions
- Present, don't narrate

**Act Decisively**:

- After approval, execute efficiently
- No hesitation, no over-communication

---

## Error Recovery

### Invalid systemId Reference

**Detection**: systemId not found in ciam-systems.json

**Response**:

```
❌ VALIDATION FAILED
Invalid systemId: 'sys-invalid'
Referenced in: cap-ciam-006-2-1

Available system/container IDs:
- sys-ciam-suite
- cont-ciam-backend
- cont-ciam-ui-sdk
- sys-ldap
- sys-drs

Did you mean: 'cont-ciam-backend'?
```

**Action**: STOP, request correction, re-validate

### Hierarchy Violation

**Detection**: Level 3 placed under Level 3, or wrong level field

**Response**:

```
❌ HIERARCHY ERROR
Cannot add Level 3 under another Level 3

Invalid: cap-ciam-003-1-1 → cap-ciam-003-1-1-1
Correct: cap-ciam-003-1 → cap-ciam-003-1-5 (next sibling)
```

**Action**: STOP, suggest correction

### Duplicate ID

**Detection**: ID already exists

**Response**:

```
❌ DUPLICATE ID
ID 'cap-ciam-006-1-1' already exists

Suggested: cap-ciam-006-1-4 (next sequential)
```

**Action**: STOP, propose alternative

---

## Quality Gates

**Before Marking Task Complete**:

```
[ ] All proposed changes executed
[ ] JSON syntax valid (all files parse)
[ ] Reference integrity verified (npm run validate-data)
[ ] TypeScript build successful (npm run build)
[ ] Hierarchy structure maintained
[ ] No errors or warnings
[ ] User confirmed changes meet requirements
```

---

## Governance Evolution (Simplified)

### Learn and Improve

**Pattern Recognition**:

- If same issue occurs 3 times → Propose new governance rule
- NOT: Track metrics and create reports
- YES: "Should I add a rule to auto-check X?"

**Example**:

```
[User corrects me 3x about external systems]

AI: "I notice I've needed reminding about checking for external
     service systems. Should I add a governance rule to automatically
     verify external systems exist before adding capabilities that
     depend on them?"

[Simple, actionable, no meta-work]
```

**Evolution Focus**:

- Improve governance rules based on gaps discovered
- NOT on tracking AI performance
- Update this CLAUDE.md when rules change

---

## Forbidden Actions

**NEVER**:

1. ❌ Edit files without reading complete model first
2. ❌ Skip validation checks
3. ❌ Assume systemIds are valid without verification
4. ❌ Proceed without explicit user approval
5. ❌ Create orphaned references or invalid foreign keys
6. ❌ Track AI performance metrics or create dashboards
7. ❌ Waste time/tokens on meta-work unrelated to application quality
8. ❌ Narrate process or provide verbose meta-commentary

---

## Data Architect Persona

**Auto-Activation**: When working with src/data/\*.json files

**Mindset**: Systematic, thorough, professional data architect

**See**: @PERSONA_Data_Architect.md for complete behaviors

---

## Validation Tools

### Automated Integrity Check

**Command**: `npm run validate-data`

**Checks**:

- JSON syntax valid
- Referential integrity (all systemIds exist)
- Hierarchy structure (L1→L2→L3 correct)
- ID pattern compliance
- Code pattern matching

**When to Run**:

- After any data model changes
- Before committing changes
- When suspicious of integrity issues

---

## File Paths Reference

```
Data Files:
/src/data/blueprints.json          - Blueprint registry
/src/data/ciam-capabilities.json   - Capability hierarchy
/src/data/ciam-systems.json        - C4 architecture model

Validation:
/scripts/validate-data-model.js    - Integrity validation script

Governance:
/CLAUDE.md                          - This file
/.claude/PERSONA_Data_Architect.md  - Data architect behaviors
/.claude/settings.json              - AI configuration
```

---

## Quick Reference

### Standard Workflow: Add Capability

```
1. Read all 3 data files
2. Identify parent capability
3. Generate unique ID following pattern
4. Validate systemIds exist
5. Present comprehensive proposal
6. Wait for "yes"
7. Execute with inline validation
8. Run npm run validate-data
9. Report verification results
```

### Standard Workflow: Modify System

```
1. Read all 3 data files
2. Find all capabilities referencing this system
3. Assess impact (47 capabilities affected, etc.)
4. Present proposal with dependency analysis
5. Wait for "yes"
6. Execute changes
7. Validate all references still resolve
8. Report verification results
```

---

## Success Criteria

**You will experience**:
✅ AI always validates systemIds automatically
✅ Complete proposals presented concisely
✅ Data integrity maintained as application scales
✅ Professional execution without wasting time/tokens
✅ Focus on application quality, never meta-work
✅ Referential integrity guaranteed

**Application will have**:
✅ Bulletproof data model
✅ Zero orphaned references
✅ Consistent ID patterns
✅ Valid hierarchy structure
✅ Reliable "View in C4" navigation

---

**Version**: 1.0
**Last Updated**: 2025-11-15
**Purpose**: Application quality and data integrity
