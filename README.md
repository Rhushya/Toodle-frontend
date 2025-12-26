# Course Builder

A React.js application that allows users to create and manage online courses by organizing content into modules and resources. The application supports drag-and-drop functionality, search, and local storage persistence.

## Live Demo

https://toodle-frontend.vercel.app/

## Features Implemented

### Module Management

- Create modules: Click "Add" then "Create module" to create a new module
- Rename modules: Click the three dots menu then "Edit module name"
- Delete modules: Click the three dots menu then "Delete" (with confirmation dialog)
- Expand/Collapse: Click on a module to toggle visibility of its contents
- Expand/Collapse All: Use the actions menu to expand or collapse all modules at once

### Resource Management

- Add Links: Click "Add" then "Add a link" or use "Add item" within a module
- Upload Files: Click "Add" then "Upload" to upload PDFs, images, and documents
- Edit Resources: Click the three dots menu on any resource to edit or rename
- Delete Resources: Click the three dots menu then "Delete" (with confirmation dialog)

### Drag and Drop

- Reorder modules: Drag modules by the handle to reorder them
- Reorder standalone items: Items outside modules can be reordered
- Move items between modules: Drag items from one module to another
- Move items into modules: Drag standalone items into a module's drop zone
- Reorder items within modules: Items inside modules can be reordered

### Outline Navigation

- Outline sidebar: Shows all modules in the course (appears when modules exist)
- Click to scroll: Click a module in the outline to scroll to it
- Scroll sync: The outline highlights the currently visible module as you scroll

### Search Functionality

- Search modules: Type in the search box to filter modules by name
- Search resources: Search also matches resource titles, URLs, and file names
- Parent-child display: When a resource matches, its parent module is shown
- Module-child display: When a module matches, all its resources are shown

### Additional Features

- Local Storage Persistence: All data is saved automatically to localStorage
- Toast Notifications: Visual feedback for all actions (add, edit, delete)
- Confirmation Dialogs: Delete actions require confirmation
- Keyboard Shortcuts:
  - Ctrl+N: New module
  - Ctrl+L: New link
  - Ctrl+U: Upload file
  - Escape: Close modals
- Export/Import: Export course data to JSON, import from JSON file
- Clear All Data: Option to reset all data (with confirmation)

## Bugs Identified and Fixed

### 1. Module Expand/Collapse State Sync

Issue: The ModuleCard component had its own local state for expand/collapse, but the parent CourseBuilder also tracked this state. This caused inconsistencies when using "Expand All" / "Collapse All".

Fix: Modified ModuleCard to support both controlled and uncontrolled modes:
- Added isExpanded and onToggleExpand props
- Component uses props when provided, falls back to internal state otherwise
- Updated SortableModule to pass these props correctly

### 2. Items Within Modules Not Sortable

Issue: Items inside modules used ModuleItem component directly, which didn't support drag-and-drop sorting.

Fix:
- Created new SortableModuleItem component wrapping ModuleItem with useSortable hook
- Updated ModuleCard to use SortableContext for module items
- Added useDroppable hook to module content area for item drops

### 3. Missing Visual Feedback for Drop Targets

Issue: No visual indication when dragging items over modules.

Fix: Added CSS class .drop-target-active with visual highlighting (teal border and background) when items are dragged over a module.

## Code Architecture

### File Structure

```
src/
  hooks/
    useLocalStorage.js           # Custom hook for localStorage persistence
  components/
    modules/
      CourseBuilder.jsx          # Main orchestrator component
      ModuleCard.jsx             # Module display with expand/collapse
      ModuleItem.jsx             # Item display within modules
      ModuleModal.jsx            # Modal for creating/editing modules
      LinkModal.jsx              # Modal for adding/editing links
      UploadModal.jsx            # Modal for uploading/renaming files
      SortableModule.jsx         # Wrapper for draggable modules
      SortableItem.jsx           # Wrapper for draggable standalone items
      SortableModuleItem.jsx     # Wrapper for draggable module items
      StandaloneItem.jsx         # Standalone item display
    ui/
      Header.jsx                 # App header with search and actions
      EmptyState.jsx             # Empty state illustration
      Outline.jsx                # Module outline sidebar
      ConfirmDialog.jsx          # Confirmation dialog component
      Toast.jsx                  # Toast notification system
  assets/                        # SVG icons and images
  App.jsx                        # Root component with ToastProvider
  App.css                        # All application styles
  main.jsx                       # React entry point
  index.css                      # Base CSS reset
```

### Key Technologies

- React 19 with hooks
- @dnd-kit for drag and drop (core, sortable, utilities)
- uuid for generating unique IDs
- Vite for build tooling

### Data Structures

```javascript
// Module
{
  id: "unique-id",
  name: "Module Name"
}

// Resource (Link)
{
  id: "unique-id",
  moduleId: "module-id" | null,  // null = standalone
  type: "link",
  title: "Display Name",
  url: "https://example.com"
}

// Resource (File)
{
  id: "unique-id",
  moduleId: "module-id" | null,
  type: "file",
  title: "Display Name",
  fileName: "original-file-name.pdf",
  fileSize: 12345,
  fileType: "application/pdf",
  fileUrl: "blob:..."
}
```

## Application Architecture

### Component Hierarchy

```
App
  CourseBuilder
    Header
    EmptyState (conditionally rendered)
    ModuleCard (multiple instances)
      ModuleItem (multiple instances)
    ModuleModal
    LinkModal
    UploadModal
```

## How to Run Locally

### Prerequisites

- Node.js (v18 or newer recommended)
- npm (v9 or newer recommended)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Rhushya/Toodle-frontend.git
```

2. Navigate to the project directory:

```bash
cd toddle-test-app
```

3. Install dependencies:

```bash
npm install
```

4. Start development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Handoff Notes for Candidates

When extending this application:

1. Follow the established component structure and naming conventions
2. Maintain consistent styling with the existing UI
3. Use React state appropriately for new features
4. Ensure responsive behavior works on all screen sizes
5. Add appropriate comments for complex logic
