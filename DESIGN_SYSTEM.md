# TutorMove Design System - Minimal Professional

## Color Palette

### Primary Colors
- **Indigo**: Primary brand color
  - `indigo-50`: #EEF2FF (Light backgrounds)
  - `indigo-100`: #E0E7FF
  - `indigo-500`: #6366F1 (Primary buttons)
  - `indigo-600`: #4F46E5 (Hover states)
  - `indigo-700`: #4338CA (Active states)

- **Blue**: Secondary accent
  - `blue-50`: #EFF6FF
  - `blue-500`: #3B82F6
  - `blue-600`: #2563EB

- **Purple**: Tertiary accent
  - `purple-50`: #FAF5FF
  - `purple-500`: #A855F7
  - `purple-600`: #9333EA

### Status Colors
- **Success/Approved**: Green
  - `green-50`: #F0FDF4
  - `green-500`: #22C55E
  - `green-600`: #16A34A

- **Warning/Pending**: Yellow/Amber
  - `yellow-50`: #FEFCE8
  - `yellow-500`: #EAB308
  - `amber-500`: #F59E0B

- **Error/Rejected**: Red
  - `red-50`: #FEF2F2
  - `red-500`: #EF4444
  - `red-600`: #DC2626

- **Info**: Cyan
  - `cyan-50`: #ECFEFF
  - `cyan-500`: #06B6D4

### Neutral Colors
- **Gray Scale**:
  - `gray-50`: #F9FAFB (Page backgrounds)
  - `gray-100`: #F3F4F6 (Card backgrounds)
  - `gray-200`: #E5E7EB (Borders)
  - `gray-300`: #D1D5DB (Dividers)
  - `gray-500`: #6B7280 (Secondary text)
  - `gray-600`: #4B5563 (Body text)
  - `gray-700`: #374151 (Headings)
  - `gray-900`: #111827 (Primary text)

## Typography

### Font Families
- **Sans-serif**: System font stack
  ```css
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif
  ```

### Font Sizes
- **Headings**:
  - `text-3xl` (30px): Main page titles
  - `text-2xl` (24px): Section headings
  - `text-xl` (20px): Card titles
  - `text-lg` (18px): Subheadings

- **Body**:
  - `text-base` (16px): Default body text
  - `text-sm` (14px): Secondary text, labels
  - `text-xs` (12px): Captions, metadata

### Font Weights
- `font-normal` (400): Body text
- `font-medium` (500): Labels, emphasized text
- `font-semibold` (600): Subheadings
- `font-bold` (700): Headings

## Spacing

### Padding
- `p-2` (8px): Tight spacing
- `p-3` (12px): Compact spacing
- `p-4` (16px): Standard spacing
- `p-6` (24px): Comfortable spacing
- `p-8` (32px): Spacious layouts

### Gaps
- `gap-2` (8px): Tight gaps
- `gap-4` (16px): Standard gaps
- `gap-6` (24px): Comfortable gaps

## Components

### Buttons

#### Primary Button
```jsx
<button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md">
  Button Text
</button>
```

#### Secondary Button
```jsx
<button className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-indigo-500 hover:text-indigo-600 transition-all duration-200">
  Button Text
</button>
```

#### Icon Button
```jsx
<button className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors">
  <Icon className="w-5 h-5" />
</button>
```

### Cards

#### Standard Card
```jsx
<div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
  {/* Card content */}
</div>
```

#### Stat Card
```jsx
<div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-gray-600 font-medium">Label</span>
    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
      <Icon className="w-5 h-5" />
    </div>
  </div>
  <div className="text-2xl font-semibold text-gray-900">Value</div>
</div>
```

### Forms

#### Input Field
```jsx
<input
  type="text"
  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
  placeholder="Enter text"
/>
```

#### Select Dropdown
```jsx
<select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

#### Textarea
```jsx
<textarea
  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
  rows={4}
  placeholder="Enter description"
></textarea>
```

### Badges/Tags

#### Status Badge
```jsx
{/* Success */}
<span className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
  Approved
</span>

{/* Warning */}
<span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
  Pending
</span>

{/* Error */}
<span className="px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
  Rejected
</span>
```

### Progress Bars

#### Colored Progress Bar
```jsx
<div className="w-full bg-gray-100 rounded-full h-2.5">
  <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: '70%' }}></div>
</div>
```

### Modals/Dialogs

```jsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900">Modal Title</h2>
    </div>
    <div className="p-6">
      {/* Modal content */}
    </div>
    <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
      <button className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
      <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg">Confirm</button>
    </div>
  </div>
</div>
```

## Layout Patterns

### Page Container
```jsx
<div className="min-h-screen bg-gray-50">
  <Navbar />
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Page content */}
  </main>
</div>
```

### Grid Layouts

#### Responsive Grid
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

#### Stat Cards Grid
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Stat cards */}
</div>
```

### Flexbox Patterns

#### Header with Actions
```jsx
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  <div>
    <h1 className="text-2xl font-semibold text-gray-900">Page Title</h1>
    <p className="text-sm text-gray-500 mt-1">Description</p>
  </div>
  <button>Action Button</button>
</div>
```

## Animation & Transitions

### Hover Effects
- `transition-all duration-200`: Standard transitions
- `hover:shadow-md`: Card hover
- `hover:scale-105`: Subtle scale effect
- `transform transition-transform`: Transform animations

### Loading States
```jsx
<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
```

## Responsive Breakpoints

- **Mobile**: Default (< 640px)
- **Tablet**: `sm:` (≥ 640px)
- **Desktop**: `md:` (≥ 768px)
- **Large Desktop**: `lg:` (≥ 1024px)
- **Extra Large**: `xl:` (≥ 1280px)

## Design Principles

1. **Minimal**: Clean, uncluttered interfaces
2. **Professional**: Business-appropriate aesthetics
3. **Consistent**: Uniform spacing, colors, and patterns
4. **Accessible**: Proper contrast ratios and touch targets
5. **Responsive**: Mobile-first, adapts to all screens
6. **Performant**: Smooth transitions and interactions
7. **Colorful (Subtle)**: Strategic use of gradients and accents
8. **Modern**: Contemporary UI patterns and trends

## Color Usage Guidelines

### Where to Use Colors

1. **Primary Actions**: Indigo/blue gradients
2. **Icon Backgrounds**: Soft color fills (50-100 range)
3. **Progress Bars**: Gradient fills based on status
4. **Status Badges**: Semantic colors (green/yellow/red)
5. **Active States**: Full saturation colors (500-600)
6. **Hover States**: Lighter backgrounds (50 range)

### Where to Keep Neutral

1. **Body Text**: Gray-600 to gray-900
2. **Backgrounds**: White, gray-50, gray-100
3. **Borders**: Gray-200 to gray-300
4. **Secondary Text**: Gray-500

## Examples of Minimal Professional Pages

### Login/Signup Pages
- Centered card layout
- Gradient header/background
- Clean form inputs with focus states
- Clear CTAs with gradient buttons

### Dashboard
- Gradient sidebar headers
- Colored stat cards with icons
- Progress bars with semantic colors
- Clean data tables

### Content Pages
- White cards on gray-50 background
- Subtle hover effects
- Colored accents for important elements
- Professional typography hierarchy
