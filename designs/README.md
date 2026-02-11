# Feature Flags Application - Desktop Designs

This directory contains the desktop UI designs for the Feature Flag management application created using Evolus Pencil.

## Design File

**File:** `feature-flags-app.ep`

This Pencil project contains comprehensive desktop designs for the entire application at 1440x900 resolution.

## Pages Included

### 1. Dashboard
- Overview statistics cards (Total Flags, Active, Inactive, Environments)
- Recently Updated Flags table
- Full app shell with sidebar and header
- Project and environment context display

### 2. Flag List
- Comprehensive data table with all flag information
- Filter toolbar (Environment, Status, Type)
- Toggle switches for enable/disable
- Type badges, tags, and formatted values
- Delete actions

### 3. Flag Detail/Edit
- Edit form for flag metadata (Name, Description)
- Default value configuration
- Environment-specific overrides table
- Color-coded environment indicators
- Save/Delete actions

### 4. Projects List
- Projects data table with status badges
- Create new project form
- Select, Make Default, Delete actions
- Project descriptions and keys

### 5. Audit Log
- Complete audit trail of all changes
- Filter toolbar (Action, Resource type)
- Timestamp, action badges, resource badges
- User attribution and details

### 6. Settings
- Tab navigation (Profile, Preferences, API Keys, Appearance)
- Profile information form
- Password change form
- Theme preview cards (Light/Dark)

## Design System

### Color Palette

#### Light Theme (Default)
- **Backgrounds:**
  - Primary: `#FFFCF5` (warm white)
  - Secondary: `#FAF7F0`
  - Card: `#FFFFFF`
  - Hover: `#F2EFEA`

- **Text:**
  - Primary: `#040403`
  - Secondary: `#535955`
  - Muted: `#A8A5A0`
  - Links: `#8E3D03`

- **Accents:**
  - Primary: `#8E3D03` (burnt orange)
  - Secondary: `#CA7A28`
  - Hover: `#7A3402`

- **Status:**
  - Success: `#1A7F37` (green)
  - Error: `#D1242F` (red)
  - Warning: `#8E3D03` (orange)
  - Info: `#CA7A28` (amber)

#### Dark Theme
- **Backgrounds:**
  - Primary: `#040403`
  - Secondary: `#0D0D0B`
  - Card: `#1A1A18`

- **Text:**
  - Primary: `#F5F2EA`
  - Secondary: `#A8A5A0`

### Typography
- **Font Family:** Arial (primary), Courier (code/monospace)
- **Heading Sizes:**
  - Page Title: 28px, bold
  - Section Title: 16-20px, bold
  - Card Title: 16px, bold
- **Body Text:** 12-14px
- **Small Text:** 10-11px

### Spacing
- **Layout:**
  - Sidebar Width: 240px
  - Header Height: 56px
  - Content Padding: 48px
  - Card Padding: 24px

- **Component Spacing:**
  - Form fields: 16-20px vertical gap
  - Table rows: 64-80px height
  - Buttons: 32-36px height

### Border Radius
- Cards: 6px
- Buttons/Inputs: 4px
- Badges: 3px
- Toggles: 12px (fully rounded)

### Shadows
- Small: `0 1px 2px rgba(0,0,0,0.08)`
- Medium: `0 4px 6px rgba(0,0,0,0.10)`
- Large: `0 10px 20px rgba(0,0,0,0.12)`

## Components

### Navigation
- **Sidebar:** Fixed left navigation with logo, main nav items, environments section, and user menu footer
- **Header:** Sticky top bar with breadcrumb, search, and primary action button
- **Breadcrumb:** Project selector dropdown + current page indicator

### Data Display
- **Stat Cards:** Large number display with label
- **Data Tables:** Sortable columns with custom cell templates
- **Badges:** Color-coded status/type indicators
- **Toggle Switches:** Enable/disable with visual feedback

### Form Controls
- **Text Inputs:** Single-line text entry with labels
- **Textareas:** Multi-line text for descriptions
- **Select Dropdowns:** Single-choice selection with arrow indicator
- **Toggle Switches:** Boolean on/off control
- **Buttons:** Primary (filled), Ghost (text only), Danger (red outline)

### Feedback
- **Loading States:** Spinner with optional label
- **Empty States:** Icon + message + optional action
- **Error Banners:** Red background with retry action
- **Toast Notifications:** Bottom-right corner alerts

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                       Header (56px)                      │
│  Breadcrumb    |    Search    |    + Create Flag        │
├──────────┬──────────────────────────────────────────────┤
│          │                                               │
│ Sidebar  │                                               │
│ (240px)  │           Main Content Area                   │
│          │                                               │
│  - Nav   │  Page Title                                   │
│  - Envs  │  Description                                  │
│  - User  │                                               │
│          │  [Content Cards/Tables/Forms]                 │
│          │                                               │
│          │                                               │
└──────────┴──────────────────────────────────────────────┘
```

## Responsive Considerations

While these designs are desktop-focused (1440x900), the actual implementation includes:
- **Mobile (<768px):** Collapsible sidebar drawer
- **Tablet (768-1024px):** Adjusted spacing and column widths
- **Desktop (>1024px):** Full layout as shown in designs

## Design Decisions

### Warm Color Scheme
- Chosen to create a friendly, approachable developer tool
- Burnt orange accent color provides good contrast and energy
- Warm whites reduce eye strain during extended use

### Information Hierarchy
- Bold links for primary actions (flag names, project names)
- Muted text for metadata (keys, descriptions, dates)
- Color-coded badges for quick visual scanning

### Environment Indicators
- Dot indicators use custom colors for instant recognition
- Consistent placement (left of name) across all contexts
- Color picker allows team customization

### Action Patterns
- Primary actions (Create, Save) use filled burnt orange buttons
- Destructive actions (Delete) use red outline or text
- Secondary actions use ghost/text-only styling

## Opening the Design File

### With Pencil Desktop Application
1. Download Evolus Pencil from https://pencil.evolus.vn/
2. Install the application
3. Open `feature-flags-app.ep` in Pencil
4. Navigate between pages using the page selector

### With Pencil VSCode Extension
1. Install the "Pencil for VS Code" extension
2. Open the file in VSCode
3. The extension will render the designs

## Exporting Designs

From Pencil, you can export to:
- **PNG:** Individual page screenshots
- **PDF:** Complete design document
- **HTML:** Interactive prototype
- **SVG:** Scalable vector graphics

## Notes

- All measurements are in pixels (px)
- Colors use hex notation
- Font weights: normal (400) or bold (700)
- The design uses standard web-safe fonts for compatibility

## Implementation Reference

These designs serve as the source of truth for:
- Layout proportions and spacing
- Color usage and combinations
- Typography scale and hierarchy
- Component appearance and states
- Data table structures
- Form layouts

Refer to the actual Angular component implementations in:
- `/src/app/features/` - Feature-specific components
- `/src/app/shared/ui/` - Reusable UI components
- `/src/app/layout/` - App shell components
- `/src/styles/` - Global styles and variables

---

**Created:** 2026-02-09
**Tool:** Evolus Pencil
**Resolution:** 1440x900 (Desktop)
**Format:** .ep (Pencil native format)
