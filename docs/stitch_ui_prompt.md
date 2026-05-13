# Prompt for UI Generation (Next.js)

*You can copy and paste the text below directly into Google Stitch or any advanced AI coding assistant to generate the frontend for this project.*

***

**System Role**: You are an expert UI/UX designer and Next.js developer. Your task is to build a premium, modern frontend for an AI-Powered Restaurant Recommendation System (similar to Zomato, but AI-curated).

**Tech Stack**: 
- Next.js (App Router)
- React
- Tailwind CSS for styling
- Framer Motion (optional, for micro-animations)
- Lucide React (for icons)

**Aesthetic & Vibe**: 
Create a stunning, premium interface. Use a modern "Glassmorphism" dark mode aesthetic with subtle, vibrant gradients (e.g., deep charcoal backgrounds with glowing red/orange accents reminiscent of food/Zomato). It must look highly professional and polished.

**Core Layout**:
The application should be a responsive, single-page dashboard divided into two main sections:
1. **Left Sidebar (or Top Nav on Mobile)**: The User Preferences Form.
2. **Main Content Area**: The Results Grid (Restaurant Cards) and Loading States.

**Required Components & Functionality**:

1. **User Preferences Form**:
   - **Location**: A text input field (e.g., "Bellandur").
   - **Budget**: A dropdown or segmented control ("Low", "Medium", "High").
   - **Cuisine**: A text input field (e.g., "Italian, Mexican").
   - **Minimum Rating**: A slider from 1.0 to 5.0 (default 4.0).
   - **Additional Preferences**: A text area for free-form requests (e.g., "Romantic vibe with live music").
   - **Submit Button**: A prominent "Find Restaurants" button. When clicked, it should disable and show a loading spinner.

2. **Loading State**:
   - While the AI is fetching data, display a beautiful "Skeleton Loader" grid or a dynamic shimmer animation in the main content area with text saying: "Analyzing dataset & querying AI...".

3. **Results Grid (Restaurant Cards)**:
   - When data is returned, display the recommendations in a responsive grid.
   - Each card must display:
     - **Restaurant Name** (prominent header)
     - **Rating** (with a star icon, visually distinct)
     - **Cuisine Tags** 
     - **Estimated Cost for Two** (e.g., "₹1500 for two")
   - **AI Explanation Section**: Below the basic details in the card, include a highlighted section titled "Why AI recommends this:" containing a paragraph of text.

4. **Empty States**:
   - Design a clean "Empty State" component if no restaurants match the filters. It should look friendly and suggest relaxing the constraints.

**Mock API Integration**:
For the purpose of this UI generation, please wire the submit button to a mock async function that simulates a 3-second network delay, and then returns a hardcoded array of 3 mock restaurant JSON objects (matching the fields described above).

Please generate the complete, functional Next.js code including the main page, components, and Tailwind configuration.
