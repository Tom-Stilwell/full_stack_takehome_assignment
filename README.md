# Tom Stilwell's Data Review Table

## Approach

### 1. **Data Fetching**
   - Data is fetched from a mock API endpoint (`/api/data`) using `axios`.
   - I used the `useEffect` hook to fetch the data when the component mounts. Any errors during the fetch process are caught and displayed to the user.

### 2. **Search & Filter**
   - A search input field allows users to filter records in real time. The table filters records based on any field, making it easier to search across multiple columns.
   - The `useMemo` hook is used to optimize the filtering process, recalculating the filtered records only when the data or search query changes.

### 3. **Table Display**
   - The records are displayed in a table with a header that stays visually aligned with the body, even when scrolling vertically.
   - Each row contains relevant fields: `ID`, `Name`, `Email`, `Street`, `Zipcode`, `Phone`, and `Status`.
   - Validation errors are color-coded based on severity (`red` for critical and `yellow` for warnings), and tooltips appear when hovering over fields with errors.
   - The `useState` and `useMemo` hooks are used to manage state and optimize rendering.

### 4. **Modal for Error Details**
   - A "View Errors" button is available for each record, which triggers a modal displaying a detailed summary of validation errors.
   - The modal includes different icons and background colors for critical (`red cross`) and warning (`yellow exclamation mark`) errors to visually communicate the severity.

### 5. **CSV Export**
   - The CSV export functionality allows users to download the currently filtered records, including the validation errors.
   - The data is flattened to ensure proper CSV format, and the `PapaParse` library is used to handle the conversion of JSON data to CSV.
   - Only the visible (filtered) records are exported, ensuring users download the data they are currently viewing.

### 6. **Tooltips**
   - Custom tooltips appear when hovering over fields that contain validation errors, providing additional information. These tooltips follow the cursor for a more dynamic user experience.

## Assumptions

- The mock data is assumed to have consistent fields across all records, though some fields may be empty or missing, such as `street` or `phone`. Empty fields are handled gracefully by displaying "N/A" where appropriate.
- The table is expected to handle a moderate number of records (e.g., 100-200). For larger datasets, further performance optimization, such as server-side pagination, would be needed.
- Validation errors are categorized into two types: `critical` and `warning`. Additional severities could be added in the future if needed.

## Improvements with More Time

### 1. **Pagination and Sorting**
   - Currently, the table displays all records in a scrollable area. For larger datasets, pagination could be introduced to improve usability and performance. Sorting capabilities could also be added to allow users to sort columns like `Name` or `Status`.

### 2. **Bulk Actions**
   - Adding support for bulk actions would enhance the user experience. For instance, users could select multiple records and apply a bulk fix or export only selected records.

### 3. **Performance Optimization**
   - For larger datasets, performance can be improved by implementing server-side filtering, pagination, and sorting.
   - While `useMemo` helps reduce unnecessary re-renders, further optimizations (e.g., virtualization of the table rows) could improve performance when handling large datasets.

### 4. **Better Error Handling and UI Feedback**
   - The current error handling in the data fetch process displays a generic error message. Improved error feedback, such as displaying more specific messages (e.g., "Network error" or "Invalid API response"), would improve clarity for users.
   - Also, integrating a loading spinner instead of a static "Loading..." message would provide a smoother user experience.

### 5. **Responsive Design**
   - While the table is relatively flexible, further improvements to the design could be made for mobile and smaller screen sizes. The table could collapse into a card-based layout for better readability on smaller devices.

### 6. **Accessibility Improvements**
   - Ensuring that the table and modal are fully accessible by adding ARIA attributes, improving keyboard navigation, and enhancing the contrast of UI elements would make the app more inclusive.