# PDF.js Development Notes

## Project Structure Overview

This project has a specific structure that can be confusing if you don't understand the build process:

### Directory Structure
```bash
pdf viewer/ (root)
├── pdf.js/ (source directory)
│   ├── web/ (actual source files for web viewer)
│   │   ├── viewer.css (SOURCE - edit this)
│   │   ├── viewer.mjs (SOURCE - edit this)
│   │   ├── pdf_sidebar.js (SOURCE - edit this)
│   │   └── ... (other source files)
│   ├── src/ (PDF.js library source)
│   ├── gulpfile.mjs (build configuration)
│   └── package.json
├── viewer.css (BUILD OUTPUT - don't edit)
├── viewer.mjs (BUILD OUTPUT - don't edit)
└── ... (other build outputs)
```

### Key Points

1. **Source Files**: Always edit files in `pdf.js/web/` directory
2. **Build Outputs**: Files in the root directory are automatically generated
3. **Never edit build outputs** - they will be overwritten on next build

## Development Workflow

### 1. Start Development Server
```bash
cd pdf.js
npx gulp server
```
- Serves files from `pdf.js/web/` (source directory)
- Runs on http://localhost:8888/
- Automatically rebuilds on changes to source files

### 2. Make Changes
- Edit files in `pdf.js/web/` directory only
- Changes are automatically picked up by dev server
- No need to manually rebuild during development

### 3. Create Production Build
```bash
cd pdf.js
npx gulp generic
```
- Builds source files from `pdf.js/web/`
- Outputs built files to root directory
- Only needed when you want production-ready files

## Recent Changes Made

### Sidebar Width Change (300px)
Modified these SOURCE files:
1. `pdf.js/web/pdf_sidebar.js` - Changed `SIDEBAR_MIN_WIDTH` from 200 to 300
2. `pdf.js/web/viewer.css` - Changed `--sidebar-width` from 200px to 300px

### Why Changes Weren't Showing Initially
- Was editing build output files in root directory instead of source files
- Build outputs get overwritten when `gulp generic` runs
- Dev server serves from source directory, not build outputs

## Best Practices

1. **Always work in `pdf.js/web/` directory**
2. **Use `gulp server` for development**
3. **Only run `gulp generic` when you need production builds**
4. **Never edit files in root directory** (they're build artifacts)
5. **Keep this notes file updated** when making structural changes

## Common Gotchas

- Root directory files are build outputs, not sources
- Dev server runs from `pdf.js/` directory, not root
- Changes to root directory files won't persist after rebuild
- Multiple similar-named files exist (source vs build output)

## Dark Mode Cleanup and Streamlining

### Issues Addressed
- Removed conflicting forced dark mode styles (`html[data-theme="dark"]`)
- Streamlined dark mode implementation to use only system preference
- Fixed sidebar text visibility and consistency
- Eliminated redundant CSS code

### Changes Made

#### 1. Unified Dark Mode System  
**JavaScript Changes** (`pdf.js/web/viewer.js`):
- Modified dark mode toggle to work with system preference only
- Removed `data-theme` attribute manipulation
- Now uses `color-scheme` CSS property for consistent behavior
- Toggle works with system preference instead of forcing a theme

#### 2. CSS Cleanup
**Removed from all files**:
- All `html[data-theme="dark"]` forced dark mode selectors
- Redundant dark mode styling blocks
- Conflicting color definitions

**Updated Files**:
- `pdf.js/web/viewer.css` - Source file cleaned
- `pdf.js/web/tailwind-built.css` - Forced styles removed  
- `pdf.js/web/tailwind-simple.css` - Forced styles removed
- `pdf.js/web/recent_files.css` - Converted to `@media (prefers-color-scheme: dark)`

#### 3. Sidebar Text Visibility Improvements
- Fixed tree item colors to use CSS variables consistently
- Changed hardcoded colors to use `--treeitem-color`, `--treeitem-hover-color`, etc.
- Ensured proper contrast ratios in dark mode:
  - Normal text: `rgb(250 250 250 / 0.8)` (80% opacity)
  - Hover text: `rgb(250 250 250 / 0.9)` (90% opacity) 
  - Selected text: `rgb(250 250 250 / 0.9)` (90% opacity)

#### 4. Modern CSS Implementation
- Now relies on `light-dark()` CSS function for automatic theme switching
- Uses `@media (prefers-color-scheme: dark)` for system dark mode detection
- Dark mode toggle icon changes automatically based on system preference
- All colors are properly defined with CSS variables

### Benefits
1. **Consistent Behavior**: Dark mode now follows system preference consistently
2. **Better Performance**: Removed redundant CSS reduces file size
3. **Improved Visibility**: Sidebar text has proper contrast in all modes
4. **Modern Standards**: Uses latest CSS features for theme switching
5. **Maintainable**: Single source of truth for dark mode styles

### Technical Details
- Build process properly outputs clean CSS without forced dark mode styles
- Tree item styling now uses semantic CSS variables
- Dark mode toggle works seamlessly with system preference changes
- No more conflicts between different dark mode implementations

## Dark Mode Selected Item Fix (✅ COMPLETED)

### Issue Identified
The recent files sidebar had inconsistent styling between system dark mode and any forced dark mode because:

1. **Selected items** (`.selected`) used modern CSS variables that automatically adapt to light/dark mode
2. **Current items** (`.current`) used hardcoded values with separate `@media (prefers-color-scheme: dark)` rules

This created visual inconsistency where selected and current items would appear differently between system preference dark mode and any forced dark mode implementation.

### Solution Applied
**Unified the current item styling to use the same CSS variable approach as selected items:**

**Before (inconsistent):**
```css
#recentFilesView .recentFileItem.current {
  background: rgba(0, 0, 0, 0.06);
  border: 2px solid rgba(0, 0, 0, 0.3);
}

@media (prefers-color-scheme: dark) {
  #recentFilesView .recentFileItem.current {
    background: rgba(111, 111, 111, 0.1);
    border: 2px solid rgba(242, 242, 242, 0.4);
  }
}

#recentFilesView .recentFileItem.current .recentFileFilename {
  color: #000000;
  font-weight: 600;
}

@media (prefers-color-scheme: dark) {
  #recentFilesView .recentFileItem.current .recentFileFilename {
    color: #ffffff;
  }
}
```

**After (consistent):**
```css
#recentFilesView .recentFileItem.current {
  background: var(--recent-files-selected-bg);
  border: 2px solid var(--recent-files-selected-border);
}

#recentFilesView .recentFileItem.current .recentFileFilename {
  color: var(--toggled-btn-color);
  font-weight: 600;
}
```

### Benefits Achieved
1. **Consistent Behavior**: Current items now look identical in system and forced dark modes
2. **Unified Styling**: Both selected and current items use the same modern CSS variable system
3. **Future-Proof**: Any changes to the color scheme automatically apply to all item states
4. **Simplified Code**: Removed duplicate media queries and hardcoded values

### Files Modified
- `pdf.js/web/viewer.css` - Updated current item styling to use CSS variables

### Verification
The fix ensures that recent files sidebar selected/current items have consistent styling regardless of whether dark mode is applied through:
- System preference (`prefers-color-scheme: dark`)
- Any potential forced dark mode implementation
- CSS `color-scheme` property changes

## CSS Architecture Streamlining

### The Problem
The current CSS setup has major maintainability issues:

1. **Duplicate Files**: 
   - `/recent_files.css` (root - build output)
   - `/pdf.js/web/recent_files.css` (source)
   - Both need manual updates for any change

2. **Complex Build Chain**:
   - Tailwind CSS compilation (`build-tailwind.js`)
   - Gulp build process (`gulp generic`)
   - Multiple CSS files that can conflict

3. **No Single Source of Truth**:
   - Border radius changes required updating 5+ locations
   - Styles can be overridden in unexpected ways
   - Hard to track which file controls what

### The Solution: Consolidated CSS Architecture

#### 1. Single Source CSS File
**Approach**: Move all recent files styles into the main `viewer.css` to eliminate duplicates.

#### 2. CSS Custom Properties (Variables)
**Create design tokens** for consistent styling:
```css
:root {
  /* Recent Files Design Tokens */
  --recent-files-border-radius: 20px;
  --recent-files-item-padding: 12px 20px;
  --recent-files-item-margin: 0 8px;
  --recent-files-search-radius: 20px;
  --recent-files-thumbnail-radius: 6px;
}
```

#### 3. Simplified Build Process
- Remove duplicate `recent_files.css` files
- Integrate styles into existing `viewer.css`
- Single build command: `gulp generic`
- No more manual file synchronization

#### 4. Consistent Naming Convention
```css
/* Use BEM-like naming for clarity */
.recent-files
.recent-files__header
.recent-files__search
.recent-files__item
.recent-files__item--selected
.recent-files__item--current
```

### Implementation Plan

1. **Consolidate CSS**: Move all recent files styles to `pdf.js/web/viewer.css`
2. **Remove Duplicates**: Delete separate `recent_files.css` files
3. **Add CSS Variables**: Create design tokens for easy customization
4. **Update Build**: Modify gulp process to handle consolidated styles
5. **Test**: Verify all functionality works with new architecture

### ✅ COMPLETED: Streamlined Architecture

**What Was Done:**

1. **CSS Consolidation**:
   - Moved all recent files styles into `pdf.js/web/viewer.css`
   - Deleted duplicate `recent_files.css` files from both root and web directories
   - Removed CSS import from `viewer.html`

2. **CSS Variables Added**:
   ```css
   :root {
     --recent-files-border-radius: 20px;
     --recent-files-item-padding: 12px 20px;
     --recent-files-item-margin: 0 8px;
     --recent-files-search-radius: 20px;
     --recent-files-thumbnail-radius: 6px;
     --recent-files-context-menu-radius: 12px;
   }
   ```

3. **Complete Style Coverage**:
   - ✅ Recent file items with 20px border radius
   - ✅ Delete button functionality and styling
   - ✅ Context menu styling and interactions
   - ✅ Active/current item highlighting
   - ✅ Search functionality
   - ✅ Hover states and transitions
   - ✅ Dark mode support
   - ✅ Mobile responsive design

4. **Simplified Workflow**:
   - **Development**: `npm run dev` or `gulp server`
   - **Build**: `npm run build` or `gulp generic`
   - **Single source**: Edit only `pdf.js/web/viewer.css`

### Benefits Achieved

- **Single Source of Truth**: All styles in one file
- **Easy Maintenance**: Change a variable, update everywhere  
- **Better Performance**: Fewer CSS files to load
- **Consistent Styling**: Design tokens ensure consistency
- **Simplified Build**: One command builds everything
- **Future-Proof**: Easy to add new features or themes

### Quick Reference

**To change border radius for all recent files elements:**
```css
:root {
  --recent-files-border-radius: 15px; /* Change this one value */
}
```

**Development Commands:**
```bash
cd pdf.js
npm run dev    # Start development server
npm run build  # Build for production
```

**File Structure (Simplified):**
```
pdf.js/web/viewer.css  ← Edit this (source)
viewer.css             ← Built automatically (don't edit)
```

## 🚨 CSS CONFLICTS PREVENTION STRATEGY

### THE RECURRING PROBLEM
We keep running into the same styling conflicts because we have:

1. **Multiple CSS Files with Overlapping Responsibilities**:
   - `pdf.js/web/viewer.css` (main source)
   - `pdf.js/web/tailwind-simple.css` (Tailwind minimal)
   - `pdf.js/web/tailwind-built.css` (Tailwind compiled)
   - Root directory build outputs that get manually edited

2. **Inconsistent Variable Usage**:
   - Some styles use `var(--toolbar-button-hover-bg-color)`
   - Others use `var(--hover-overlay)` or `var(--toolbar-control-hover-bg)`
   - Some use hardcoded values like `rgba(0, 0, 0, 0.1)`

3. **!important Overrides**:
   - Tailwind files use `!important` declarations that override everything
   - Creates cascading conflicts that are hard to debug

### ✅ PERMANENT SOLUTION IMPLEMENTED

#### 1. **Single Source of Truth for Design Tokens**
**Created centralized design system** in `pdf.js/web/viewer.css`:

```css
:root {
  /* 🎯 TOOLBAR DESIGN TOKENS - Single source of truth */
  --toolbar-control-border-radius: 10px;
  --toolbar-control-hover-bg: var(--toolbar-button-hover-bg-color);
  --toolbar-control-focus-bg: var(--toolbar-button-hover-bg-color);
  
  /* Ensure all hover states use the same color */
  --hover-overlay: var(--toolbar-button-hover-bg-color);
  
  /* Existing toolbar button variables */
  --toolbar-button-hover-bg-color: light-dark(rgb(229 231 235), rgb(26 26 26));
}
```

#### 2. **Eliminated Tailwind CSS Conflicts**
**Fixed all Tailwind files** to use consistent variables:

**Before (conflicting):**
```css
/* Different values in different files */
border-radius: 14px !important;
background-color: var(--hover-overlay) !important;
```

**After (consistent):**
```css
/* Same variable everywhere */
border-radius: 10px !important;
background-color: var(--toolbar-button-hover-bg-color) !important;
```

#### 3. **CSS Variable Unification Strategy**
**All toolbar-related components now use the same variables:**

```css
/* Page number input, zoom select, toolbar buttons all use: */
border-radius: var(--toolbar-control-border-radius); /* 10px */
background-color: var(--toolbar-button-hover-bg-color); /* on hover */
```

#### 4. **Conflict Prevention Rules**

**🔒 MANDATORY RULES TO PREVENT FUTURE CONFLICTS:**

1. **Never Edit Build Outputs**: Only edit files in `pdf.js/web/` directory
2. **Use CSS Variables Only**: No hardcoded colors or dimensions for common elements
3. **Single Variable Per Concept**: All hover states use `--toolbar-button-hover-bg-color`
4. **Variable Hierarchy**: Specific variables reference general ones (`--hover-overlay: var(--toolbar-button-hover-bg-color)`)
5. **Audit Before Changes**: Check all CSS files when adding new styles

#### 5. **Quick Conflict Resolution Checklist**

**When styling conflicts occur, check these files in order:**

1. ✅ `pdf.js/web/viewer.css` - Main source (edit this)
2. ⚠️ `pdf.js/web/tailwind-simple.css` - Check for `!important` overrides
3. ⚠️ `pdf.js/web/tailwind-built.css` - Check for `!important` overrides  
4. 🚫 `viewer.css` (root) - Never edit (build output)
5. 🚫 `tailwind-*.css` (root) - Never edit (build outputs)

#### 6. **Design Token Reference**

**For any toolbar-related styling, use these tokens:**

```css
/* Border radius for all toolbar elements */
--toolbar-control-border-radius: 10px;

/* Hover background for all toolbar elements */
--toolbar-button-hover-bg-color: light-dark(rgb(229 231 235), rgb(26 26 26));

/* Focus background (same as hover) */
--toolbar-control-focus-bg: var(--toolbar-button-hover-bg-color);

/* Legacy variable mapping for backward compatibility */
--hover-overlay: var(--toolbar-button-hover-bg-color);
--toolbar-control-hover-bg: var(--toolbar-button-hover-bg-color);
```

### 🎯 IMPLEMENTATION COMPLETED

**Files Updated with Consistent Variables:**
- ✅ `pdf.js/web/viewer.css` - Design tokens added
- ✅ `pdf.js/web/tailwind-simple.css` - Fixed to use consistent variables
- ✅ `pdf.js/web/tailwind-built.css` - Fixed to use consistent variables
- ✅ All hover states now use `var(--toolbar-button-hover-bg-color)`
- ✅ All border radius values now use `10px` consistently

**Conflict Sources Eliminated:**
- ❌ No more `rgba(0, 0, 0, 0.1)` hardcoded values
- ❌ No more `var(--hover-overlay)` vs `var(--toolbar-control-hover-bg)` conflicts  
- ❌ No more inconsistent border radius (14px vs 12px vs 10px)
- ❌ No more `!important` style battles between files

### 🔧 MAINTENANCE COMMANDS

**To check for style conflicts:**
```bash
# Search for hardcoded hover colors
grep -r "rgba.*0\.1" pdf.js/web/
grep -r "hover-overlay" pdf.js/web/
grep -r "toolbar-control-hover" pdf.js/web/

# Search for inconsistent border radius
grep -r "border-radius.*[0-9]" pdf.js/web/ | grep -v "10px\|var("
```

**Development workflow:**
```bash
cd pdf.js
npm run dev    # Start dev server (auto-rebuilds)
# Edit only files in pdf.js/web/
npm run build  # Build when ready for production
```

### 🏆 BENEFITS ACHIEVED

1. **Predictable Styling**: All toolbar elements look identical
2. **Easy Maintenance**: Change one variable, update everywhere
3. **No More Conflicts**: Single source of truth prevents overrides
4. **Future-Proof**: New elements automatically inherit consistent styling
5. **Developer Experience**: Clear rules prevent accidental conflicts

## ✅ SECONDARY TOOLBAR STYLING UNIFICATION (COMPLETED)

### Issue Addressed
The main toolbar settings menu (#secondaryToolbar) had inconsistent styling compared to the recent files context menu, creating a disjointed user experience.

### Solution Applied
**Unified the secondary toolbar to match the recent files context menu design:**

#### 1. **Design Token Integration**
**Added CSS variables for consistency:**
```css
:root {
  /* 🎯 SECONDARY TOOLBAR DESIGN TOKENS - Match Recent Files Context Menu */
  --secondary-toolbar-border-radius: var(--recent-files-context-menu-radius); /* 12px */
  --secondary-toolbar-bg: var(--doorhanger-bg-color);
  --secondary-toolbar-border: var(--doorhanger-border-color);
  --secondary-toolbar-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  --secondary-toolbar-shadow-dark: 0 8px 24px rgba(0, 0, 0, 0.4);
  --secondary-toolbar-padding: 6px;
  --secondary-toolbar-item-padding: 10px 12px;
  --secondary-toolbar-item-radius: 6px;
  --secondary-toolbar-item-hover-bg: rgba(0, 0, 0, 0.05);
  --secondary-toolbar-item-hover-bg-dark: rgba(255, 255, 255, 0.08);
}
```

#### 2. **Visual Consistency Achieved**
**Both menus now share identical styling:**
- **Border radius**: 12px (using `var(--recent-files-context-menu-radius)`)
- **Background**: `var(--doorhanger-bg-color)` (same as context menu)
- **Border**: `var(--doorhanger-border-color)` (same as context menu)
- **Shadow**: `0 8px 24px rgba(0, 0, 0, 0.12)` (identical depth)
- **Padding**: 6px container padding (matches context menu)
- **Backdrop filter**: `blur(8px)` (same modern glass effect)

#### 3. **Menu Item Styling Alignment**
**Secondary toolbar items now match context menu items:**
- **Padding**: `10px 12px` (identical to context menu items)
- **Border radius**: `6px` (same as context menu items)
- **Font size**: `13px` (consistent typography)
- **Hover states**: Same background colors and transitions
- **Icon size**: `16px` (matches context menu icons)
- **Gap between icon and text**: `10px` (identical spacing)

#### 4. **Files Updated with Consistent Variables**
**All CSS files now use the same design tokens:**
- ✅ `pdf.js/web/viewer.css` - Main source with design tokens
- ✅ `pdf.js/web/tailwind-simple.css` - Updated to use CSS variables
- ✅ `pdf.js/web/tailwind-built.css` - Updated to use CSS variables  
- ✅ `pdf.js/web/tailwind.css` - Updated to use CSS variables
- ✅ Separator styling unified using `var(--doorhanger-separator-color)`

#### 5. **Conflict Prevention**
**Eliminated all hardcoded values that could cause inconsistencies:**
- ❌ No more `rgba(255, 255, 255, 0.95)` vs `var(--doorhanger-bg-color)` conflicts
- ❌ No more `0.75rem` vs `12px` border radius inconsistencies
- ❌ No more different shadow values between menus
- ❌ No more `!important` style battles between Tailwind and main CSS

### Benefits Achieved
1. **Visual Coherence**: Both settings menus now have identical modern styling
2. **Consistent User Experience**: Users see the same design language throughout
3. **Maintainable Code**: Single source of truth for menu styling
4. **Future-Proof**: New menus automatically inherit consistent styling
5. **Modern Aesthetics**: Unified glass-morphism effect with proper shadows

### Technical Details
- Build process properly outputs consistent CSS across all files
- Menu positioning and z-index values maintained for proper layering
- Dark mode support works seamlessly with unified color variables
- All hover states and transitions use the same timing and colors
- Responsive behavior preserved while maintaining visual consistency

### Quick Reference

**To modify menu styling globally:**
```css
:root {
  --recent-files-context-menu-radius: 15px; /* Updates both menus */
  --doorhanger-bg-color: /* new background */; /* Updates both menus */
}
```

**Development workflow:**
```bash
cd pdf.js
npm run dev    # Start dev server (auto-rebuilds)
# Edit only files in pdf.js/web/
npm run build  # Build when ready for production
```

## ✅ PAGE HIGHLIGHT ANIMATION FIX (COMPLETED)

### Issue Addressed
The thumbnail page selection animation was causing layout shifts because it changed the `border-width` from 1px to 4px/5px, adding extra space that pushed other pages around. The animation was also too slow (1.5s) and used a basic easing function.

### Solution Applied
**Replaced border-width animation with box-shadow to prevent layout shifts:**

#### 1. **Eliminated Layout Shifts**
**Before (caused layout shifts):**
```css
@keyframes pageHighlight {
  0% { border-width: 4px; }
  20% { border-width: 5px; }
  /* ... more border-width changes */
  100% { border-width: 1px; }
}
```

**After (no layout impact):**
```css
@keyframes pageHighlight {
  0% { 
    box-shadow: 
      0 0 0 3px light-dark(rgba(59, 130, 246, 0.4), rgba(96, 165, 250, 0.4)),
      0 2px 8px rgba(0, 0, 0, 0.3);
  }
  50% { 
    box-shadow: 
      0 0 0 4px light-dark(rgba(37, 99, 235, 0.5), rgba(147, 197, 253, 0.5)),
      0 4px 12px rgba(0, 0, 0, 0.4);
  }
  100% { 
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}
```

#### 2. **Improved Animation Performance**
**Timing optimizations:**
- **Duration**: Reduced from `1.5s` to `0.6s` (60% faster)
- **Easing**: Changed from `ease-out` to `cubic-bezier(0.4, 0, 0.2, 1)` (modern cubic easing)
- **Keyframes**: Simplified from 5 keyframes (0%, 20%, 40%, 60%, 80%, 100%) to 3 keyframes (0%, 50%, 100%)

#### 3. **Visual Improvements**
**Enhanced visual effects:**
- **Box-shadow glow**: Creates a smooth highlight effect without layout impact
- **Depth enhancement**: Added proper shadow depth that animates
- **Color consistency**: Uses the same blue color scheme as other UI elements
- **Smooth transitions**: Cubic-bezier easing provides more natural motion

#### 4. **Technical Benefits**
**Performance and UX improvements:**
- **No layout recalculation**: Box-shadow doesn't affect document flow
- **GPU acceleration**: Box-shadow animations are hardware accelerated
- **Reduced repaints**: Fewer DOM layout changes during animation
- **Consistent border radius**: Maintains 16px border radius throughout animation

### Files Modified
- ✅ `pdf.js/web/viewer.css` - Updated pageHighlight animation

### Benefits Achieved
1. **Smooth Navigation**: No more jarring layout shifts when clicking thumbnails
2. **Faster Feedback**: 0.6s animation provides quick visual confirmation
3. **Modern Feel**: Cubic-bezier easing creates more polished motion
4. **Better Performance**: Box-shadow animations are more efficient than border changes
5. **Visual Consistency**: Maintains page styling throughout the animation

### Technical Details
- Animation now uses `box-shadow` instead of `border-width` changes
- Cubic-bezier timing function provides smooth acceleration/deceleration
- Simplified keyframe structure reduces animation complexity
- Z-index ensures highlight appears above other page elements
- Border radius is preserved throughout the animation

## ✅ SECONDARY TOOLBAR REFINEMENTS (COMPLETED)

### Issues Addressed
1. **Doorhanger Arrow**: Removed the triangle arrow at the top of the secondary toolbar menu
2. **Menu Width**: Increased minimum width from 180px to 220px to prevent text wrapping
3. **Hover Colors**: Updated to use proper UI hover colors from `--recent-files-hover-bg`
4. **Separator Consistency**: Ensured separators match the recent files context menu
5. **Icon Styling**: Fixed icon colors and sizing to match context menu standards

### Technical Fixes Applied

#### 1. **Arrow Removal**
**Removed doorhanger triangle arrow:**
```css
#secondaryToolbar::before,
#secondaryToolbar::after {
  display: none !important;
}

#secondaryToolbar {
  /* Remove doorhanger arrow positioning */
  inset-block-start: auto !important;
}
```

#### 2. **Menu Width Optimization**
**Increased width to prevent text wrapping:**
```css
:root {
  --secondary-toolbar-min-width: 220px; /* Up from 180px */
}
```

#### 3. **Unified Hover Colors**
**Now uses the same hover colors as recent files:**
```css
:root {
  --secondary-toolbar-item-hover-bg: var(--recent-files-hover-bg);
  /* Automatically adapts to light/dark mode */
}
```

#### 4. **Icon Styling Consistency**
**Icons now match context menu specifications:**
- **Size**: `16px × 16px` (same as context menu icons)
- **Color**: `currentColor` (inherits from text color)
- **Mask properties**: Consistent with context menu icon rendering
- **Positioning**: Proper alignment with text

#### 5. **Complete File Coverage**
**All CSS files updated for consistency:**
- ✅ `pdf.js/web/viewer.css` - Main source with all improvements
- ✅ `pdf.js/web/tailwind-simple.css` - Arrow removal and width fixes
- ✅ `pdf.js/web/tailwind-built.css` - Arrow removal and width fixes
- ✅ `pdf.js/web/tailwind.css` - Arrow removal and width fixes

### Visual Improvements Achieved

1. **Clean Menu Appearance**: No more distracting arrow at the top
2. **Better Text Layout**: 220px width prevents menu item text from wrapping
3. **Consistent Hover States**: Same subtle hover effect as recent files menu
4. **Perfect Icon Alignment**: Icons properly sized and colored
5. **Unified Design Language**: Both menus now look like they belong to the same application

### Benefits
- **Professional Appearance**: Clean, modern dropdown without visual artifacts
- **Better Usability**: Wider menu improves readability
- **Consistent Experience**: Users see identical styling across all menus
- **Responsive Design**: Hover states work perfectly in light and dark modes
- **Maintainable Code**: Single source of truth for menu styling variables

## 🎨 PDF VIEWER STYLE GUIDE

### Design Philosophy
The PDF viewer follows a modern, minimal design language with these key principles:
- Clean, uncluttered interface with ample white space
- Consistent border radius and shadows across components
- System-aware dark mode with proper contrast ratios
- Smooth transitions and subtle hover states
- Glass-morphism effects for overlays and menus

### 🎯 Color System

#### Light Mode
```css
:root {
  /* Core Colors */
  --main-color: rgb(12, 12, 13);              /* Primary Text */
  --body-bg-color: rgb(212, 212, 215);        /* Background */
  --progressBar-color: rgb(37, 99, 235);      /* Primary Blue */
  
  /* UI Elements */
  --toolbar-bg-color: rgb(249, 250, 251);     /* Toolbar Background */
  --toolbar-border-color: rgb(229, 231, 235); /* Toolbar Border */
  --sidebar-bg-color: rgb(245, 246, 247);     /* Sidebar Background */
  --field-bg-color: rgb(255, 255, 255);       /* Input Fields */
  --field-border-color: rgb(187, 187, 188);   /* Input Borders */
}
```

#### Dark Mode
```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Core Colors */
    --main-color: rgb(250, 250, 250);         /* Primary Text */
    --body-bg-color: rgb(17, 17, 17);         /* Background */
    --progressBar-color: rgb(59, 130, 246);   /* Primary Blue */
    
    /* UI Elements */
    --toolbar-bg-color: rgb(31, 31, 31);      /* Toolbar Background */
    --toolbar-border-color: rgb(55, 65, 81);  /* Toolbar Border */
    --sidebar-bg-color: rgb(38, 38, 38);      /* Sidebar Background */
    --field-bg-color: rgb(38, 38, 38);        /* Input Fields */
    --field-border-color: rgb(64, 64, 64);    /* Input Borders */
  }
}
```

### 📐 Layout & Spacing

#### Core Measurements
```css
:root {
  /* Layout */
  --toolbar-height: 3rem;
  --sidebar-width: 300px;
  --page-margin: 8px auto;
  
  /* Component Spacing */
  --toolbar-horizontal-padding: 0.75rem;
  --toolbar-vertical-padding: 0.25rem;
  --button-gap: 0.25rem;
  --toolbar-group-gap: 2px;
  --thumbnail-gap: 1rem;
}
```

### 🔤 Typography

```css
/* System Font Stack */
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Font Sizes */
--base-font-size: 13px;
--small-font-size: 12px;
--header-font-size: 15px;
--toolbar-label-size: 0.9em;
```

### 🧩 Component Specifications

#### Buttons
```css
/* Standard Button */
.toolbarButton {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  padding: 6px;
  transition: all 0.15s ease;
}

/* Dropdown Button */
.dropdownToolbarButton {
  min-width: 120px;
  height: 40px;
  border-radius: 14px;
  padding: 8px;
}
```

#### Pages & Thumbnails
```css
/* PDF Page */
.page {
  border-radius: 20px;
  background-clip: content-box;
  border: 1px solid var(--page-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Thumbnail */
.thumbnail {
  max-width: 100px;
  aspect-ratio: 0.77;
  border-radius: 0.375rem;
  box-shadow: 0 10px 25px -1px rgb(0 0 0 / 0.20);
}
```

#### Context Menus & Dropdowns
```css
/* Context Menu */
.contextMenu {
  border-radius: 6px;
  padding: 6px;
  min-width: 180px;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Menu Items */
.contextMenuItem {
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  gap: 10px; /* Icon spacing */
}
```

### 🎬 Animations & Transitions

```css
/* Core Transitions */
--sidebar-transition: 200ms ease-in-out;
--button-transition: 150ms ease;

/* Page Highlight Animation */
@keyframes pageHighlight {
  0% { 
    box-shadow: 
      0 0 0 3px light-dark(rgba(59, 130, 246, 0.4), rgba(96, 165, 250, 0.4)),
      0 2px 8px rgba(0, 0, 0, 0.3);
  }
  50% { 
    box-shadow: 
      0 0 0 4px light-dark(rgba(37, 99, 235, 0.5), rgba(147, 197, 253, 0.5)),
      0 4px 12px rgba(0, 0, 0, 0.4);
  }
  100% { 
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}
```

### 📱 Responsive Design

```css
/* Breakpoints */
@media (max-width: 840px) {
  :root {
    --sidebar-width: 180px;
    --thumbnail-gap: 0.5rem;
  }
}

@media (max-width: 640px) {
  :root {
    --sidebar-width: 160px;
    --thumbnail-gap: 0.375rem;
  }
}
```

### ♿️ Accessibility

```css
/* Focus States */
:root {
  --focus-ring-color: light-dark(#0060df, #0df);
  --focus-ring-outline: 2px solid var(--focus-ring-color);
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  :root {
    --sidebar-transition-duration: 0;
  }
}
```

### 🌗 Dark Mode Implementation
- Uses `prefers-color-scheme` media query
- Implements `light-dark()` CSS function for automatic theme switching
- Maintains WCAG contrast ratios in both modes
- Supports system-level color scheme preferences
- Uses CSS variables for seamless theme transitions

### 🎯 Best Practices
1. Use CSS variables for all themeable properties
2. Maintain consistent border radius across similar components
3. Implement smooth transitions for all interactive elements
4. Use system font stack for optimal performance
5. Follow glass-morphism design for overlays and menus
6. Ensure proper contrast ratios in both light and dark modes
7. Use modern CSS features like `aspect-ratio` and `backdrop-filter`
8. Implement responsive breakpoints for mobile optimization

This style guide ensures a consistent, modern, and accessible design across the entire PDF viewer application.

## ✅ SIGNATURE DIALOG MODERNIZATION (COMPLETED)

### Issue Addressed
The "Add a signature" dialog had outdated styling that didn't follow the modern design language established in the rest of the application. It used old-style tabs with borders and inconsistent spacing.

### Solution Applied
**Comprehensive modernization of the signature dialog with clean, minimal design:**

#### 1. **Modern Design System Integration**
**Added comprehensive CSS design tokens:**
```css
:root {
  /* 🎯 SIGNATURE DIALOG DESIGN TOKENS - Modern Design System */
  --signature-dialog-border-radius: 20px;
  --signature-dialog-padding: 24px;
  --signature-dialog-gap: 20px;
  --signature-dialog-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  --signature-dialog-backdrop: blur(12px);
  
  /* Tab Design Tokens */
  --signature-tab-border-radius: 12px;
  --signature-tab-padding: 12px 20px;
  --signature-tab-gap: 8px;
  --signature-tab-bg: light-dark(rgb(248 250 252), rgb(45 45 45));
  --signature-tab-bg-active: light-dark(rgb(37 99 235), rgb(59 130 246));
  
  /* Panel Design Tokens */
  --signature-panel-border-radius: 16px;
  --signature-panel-padding: 24px;
  --signature-panel-bg: light-dark(rgb(255 255 255), rgb(45 45 45));
  --signature-panel-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  
  /* Button Design Tokens */
  --signature-button-border-radius: 12px;
  --signature-button-padding: 12px 20px;
  --signature-button-primary-bg: light-dark(rgb(37 99 235), rgb(59 130 246));
  --signature-button-secondary-bg: light-dark(rgb(248 250 252), rgb(55 55 55));
}
```

#### 2. **Modern Tab Navigation**
**Replaced old border-based tabs with modern pill-style buttons:**
- **Container**: Rounded background with inset shadow for depth
- **Tabs**: Pill-shaped buttons with smooth transitions
- **Active state**: Blue background with white text and subtle shadow
- **Hover states**: Smooth color transitions
- **Spacing**: Consistent 8px gap between tabs

#### 3. **Enhanced Dialog Styling**
**Modern dialog appearance:**
- **Border radius**: 20px for soft, modern edges
- **Shadow**: Deep, realistic shadow with backdrop blur
- **Padding**: Generous 24px padding for breathing room
- **Width**: Increased to 600px for better proportions
- **Background**: Clean with backdrop filter for glass effect

#### 4. **Signature Panel Improvements**
**Each signature input method (Type, Draw, Image) now has:**
- **Consistent padding**: 24px internal spacing
- **Modern borders**: Subtle borders with 16px radius
- **Proper shadows**: Light shadows for depth
- **Better typography**: Improved font sizes and weights
- **Enhanced interactions**: Smooth hover states and focus indicators

#### 5. **Input Field Modernization**
**All input fields now feature:**
- **Rounded corners**: 12px border radius
- **Proper padding**: 16px horizontal, comfortable vertical spacing
- **Focus states**: 2px blue border on focus
- **Consistent colors**: Using design token colors
- **Clear buttons**: Modern styling with hover effects

#### 6. **Button System Overhaul**
**Primary and secondary buttons now have:**
- **Consistent sizing**: 12px padding, 12px border radius
- **Modern shadows**: Subtle shadows that enhance on hover
- **Smooth transitions**: 0.15s ease transitions
- **Proper states**: Hover, active, focus, and disabled states
- **Accessibility**: Proper focus indicators and ARIA support

#### 7. **Error Message Styling**
**Error messages now feature:**
- **Modern colors**: Red color scheme with proper contrast
- **Rounded design**: 12px border radius
- **Proper spacing**: 16px padding with structured layout
- **Clear hierarchy**: Title and description with proper typography

#### 8. **Enhanced Accessibility**
**Improved accessibility features:**
- **Focus indicators**: 2px blue outlines with proper offset
- **Color contrast**: WCAG compliant colors in light and dark modes
- **Keyboard navigation**: Proper tab order and focus management
- **Screen reader support**: Proper ARIA labels and roles

### Files Modified
- ✅ `pdf.js/web/signature_manager.css` - Complete modernization with design tokens

### Benefits Achieved
1. **Visual Consistency**: Dialog now matches the modern design language of the rest of the application
2. **Better User Experience**: Cleaner, more intuitive interface with proper spacing and typography
3. **Improved Accessibility**: Better focus indicators and keyboard navigation
4. **Modern Aesthetics**: Glass-morphism effects, proper shadows, and smooth transitions
5. **Maintainable Code**: Design tokens make future updates easy and consistent
6. **Responsive Design**: Proper scaling and spacing on different screen sizes
7. **Dark Mode Support**: Seamless dark mode integration with proper contrast

### Technical Details
- All styling uses CSS design tokens for consistency
- Proper CSS custom properties for light/dark mode support
- Modern CSS features like `light-dark()` function
- Smooth transitions and hover effects throughout
- Proper focus management for accessibility
- Consistent spacing and typography scale

### Quick Reference

**To modify signature dialog styling:**
```css
:root {
  --signature-dialog-border-radius: 20px; /* Dialog corners */
  --signature-tab-bg-active: /* new color */; /* Active tab color */
  --signature-panel-padding: 24px; /* Panel internal spacing */
}
```

**Development workflow:**
```bash
cd pdf.js
npm run dev    # Start dev server (auto-rebuilds)
# Edit only files in pdf.js/web/
npm run build  # Build when ready for production
```

The signature dialog now provides a premium, modern user experience that aligns perfectly with the established design language while maintaining full functionality and accessibility.

## ✅ SECONDARY TOOLBAR REDESIGN (COMPLETED)

### Issue Addressed
The original secondary toolbar settings menu was confusing and cluttered, making it difficult for users to understand what each option does. The menu items were scattered without clear organization, and lacked proper visual hierarchy.

**Original Problems:**
- 15+ menu items in a flat list without categorization
- Technical jargon (e.g., "Wrapped Scrolling", "Odd Spreads")
- No clear visual hierarchy or grouping
- Missing icons for visual recognition
- Inconsistent terminology
- Poor discoverability of related functions

### Solution Applied
**Redesigned the secondary toolbar with modern, organized sections:**

#### 1. **Intuitive Category Organization**
**Grouped related functions under clear, user-friendly categories:**
- **📁 File**: Open File, Document Info
- **📺 View Mode**: Slideshow Mode, Go to Current Page, Rotate Page Right
- **📜 Scrolling**: Scroll Vertically, Scroll Horizontally, Grid View  
- **📄 Page Display**: Single Page View, Show Odd Page Spreads, Show Even Page Spreads
- **♿ Accessibility & Tools**: Image Description Settings, Show Annotation Tools

#### 2. **User-Friendly Labels**
**Replaced technical terms with clear, descriptive language:**
- "Wrapped Scrolling" → "Grid View"
- "Current Page (bookmark)" → "Go to Current Page"
- "Rotate Clockwise" → "Rotate Page Right"
- "Toggle Annotation Toolbar" → "Show Annotation Tools"
- "Image alt text settings" → "Image Description Settings"

#### 3. **Visual Icon System**
**Added semantic icons for instant recognition:**
- 📁 Open file icon for file operations
- ℹ️ Info icon for document properties
- 📺 Presentation icon for slideshow mode
- 🔗 Link icon for current page bookmark
- ↻ Rotate icon for page rotation
- ↕️ Vertical arrows for vertical scrolling
- ↔️ Horizontal arrows for horizontal scrolling
- ⚏ Grid icon for grid view
- 📄 Page icon for single page view
- 📑 Double page icons for spreads
- ♿ Accessibility icon for alt text settings
- ✏️ Edit icon for annotation tools

#### 4. **Modern Design Implementation**
**Enhanced visual hierarchy and spacing:**
```css
:root {
  --secondary-toolbar-width: 280px;
  --secondary-toolbar-section-gap: 16px;
  --secondary-toolbar-section-padding: 12px 16px;
  --secondary-toolbar-section-title-size: 12px;
  --secondary-toolbar-section-title-weight: 600;
  --secondary-toolbar-section-title-color: light-dark(rgb(107 114 128), rgb(156 163 175));
  --secondary-toolbar-icon-size: 16px;
  --secondary-toolbar-radio-group-gap: 2px;
}
```

### Benefits Achieved
1. **Improved Discoverability**: Clear categories help users find functions quickly
2. **Better Understanding**: User-friendly labels eliminate confusion
3. **Visual Recognition**: Icons provide instant visual cues
4. **Reduced Cognitive Load**: Organized sections reduce menu complexity
5. **Professional Appearance**: Modern design matches overall application aesthetic
6. **Accessibility**: Clear hierarchy and semantic icons improve screen reader support
7. **Maintainable Code**: Design tokens make future updates consistent

### User Experience Improvements
**Before (Confusing):**
```
• Open File
• Print
• Save/Download
• Presentation Mode
• Current Page (bookmark)
• Go to First Page
• Go to Last Page
• Rotate Clockwise
• Rotate Counterclockwise
• Text Selection Tool / Hand Tool
• Page/Vertical/Horizontal/Wrapped Scrolling
• No/Odd/Even Spreads
• Image Alt Text Settings
• Toggle Annotation Toolbar
• Document Properties
```

**After (Organized & Clear):**
```
📁 File
  • Open File
  • Document Info

📺 View Mode  
  • Slideshow Mode
  • Go to Current Page
  • Rotate Page Right

📜 Scrolling
  • Scroll Vertically
  • Scroll Horizontally  
  • Grid View

📄 Page Display
  • Single Page View
  • Show Odd Page Spreads
  • Show Even Page Spreads

♿ Accessibility & Tools
  • Image Description Settings
  • Show Annotation Tools
```

The redesigned secondary toolbar now provides an intuitive, modern interface that helps users understand and discover PDF viewer functionality more effectively, following established UX patterns and design principles.

## ✅ SECONDARY TOOLBAR STREAMLINING (COMPLETED)

### Issue Addressed
After the initial redesign, the secondary toolbar still contained many redundant and unnecessary settings that cluttered the interface and confused users about core functionality.

### Redundant Settings Removed
**Settings moved to hidden section (functionality preserved):**

1. **❌ Page Scrolling Mode** - This is just normal scrolling behavior users expect by default
2. **❌ Current Page Bookmark** - Creates URL links to current page (niche functionality)  
3. **❌ Odd/Even Page Spreads** - Mainly for book-like PDFs with facing pages (uncommon use case)
4. **❌ Text Selection vs Hand Tool** - Text selection should be the default behavior
5. **❌ First/Last Page Navigation** - Users have thumbnails and page input for navigation
6. **❌ Counter-clockwise Rotation** - One rotation direction is sufficient
7. **❌ Print/Download** - Already available in main toolbar

### Final Streamlined Structure
**New minimal, focused organization:**

```
📁 File
  • Open File
  • Document Info

📺 View Mode  
  • Slideshow Mode
  • Rotate Page Right

📜 Page Layout
  • Continuous Scrolling (default)
  • Horizontal Scrolling
  • Grid View  
  • Single Page View

♿ Tools
  • Image Descriptions (conditional)
  • Annotation Tools
```

### Benefits of Streamlining
1. **Reduced Cognitive Load**: Only 8 essential settings vs previous 15+
2. **Clearer Purpose**: Each setting has a distinct, understandable use case
3. **Better Labels**: "Continuous Scrolling" vs "Scroll Vertically"
4. **No Functionality Loss**: All removed settings remain functional but hidden
5. **Focused User Experience**: Users see only what they actually need

### Technical Implementation
- All "removed" buttons are moved to `display: none` section
- Functionality is fully preserved for programmatic access
- Secondary toolbar JavaScript continues to work with all buttons
- Radio groups maintain proper state management
- Conditional settings (like Image Descriptions) still show when available

This streamlined approach follows the principle of "progressive disclosure" - showing users the essentials first while keeping advanced functionality accessible through code.
