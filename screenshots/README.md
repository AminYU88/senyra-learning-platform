# Screenshot Capture Guide

Replace the placeholder PNG files in this folder with clean desktop screenshots from the running Senyra application.

Use a 1440px or wider desktop viewport. Avoid browser bookmarks, developer tools, terminal windows, personal accounts, and private data.

## Required Screenshots

- `student-dashboard.png` - Capture the student dashboard at `/dashboard` after logging in as a student.
- `teacher-dashboard.png` - Capture the teacher dashboard at `/teacher` after logging in as a teacher.
- `admin-dashboard.png` - Capture the admin dashboard at `/admin` after logging in as an admin.
- `creativity-engine.png` - Capture the Creativity Intelligence Engine at `/creativity-assessment`.
- `learning-dna.png` - Capture the Learning DNA profile or questionnaire at `/learning-dna`.
- `flow-state.png` - Capture Flow State Analytics at `/flow-state`.
- `cognitive-risk.png` - Capture Cognitive Risk Prediction at `/cognitive-risk`.
- `explainable-ai.png` - Capture the Explainable AI dashboard at `/explainable-ai`.

## Recommended Demo Flow

1. Start the backend with `uvicorn backend.main:app --reload`.
2. Start the frontend with `npm run dev` from the `frontend/` folder.
3. Log in with the appropriate demo role.
4. Navigate to each route above.
5. Capture the main content area in a desktop browser.
6. Save each image with the exact filename listed above.
