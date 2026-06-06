# Job Application Tracker

A Kanban-style job application tracking dashboard built with Next.js 16, MongoDB, and Better Auth. This project was initially bootstrapped from a [PedroTech YouTube tutorial](https://www.youtube.com/watch?v=vCIsrOGNhas&t=19371s) and has been significantly extended with additional functionality.

## Features

### Core Features (from tutorial)

- Drag-and-drop Kanban board for tracking job applications
- Create, read, update, and delete job application cards
- Organize applications into customizable columns
- User authentication with Better Auth
- Responsive design with Tailwind CSS

### Extended Features

#### User Profile & Settings

- **Profile Picture**: Upload and update profile images stored in Cloudinary
- **Update User Details**: Change display name, email, and password
- **Account Management**: Delete account with confirmation
- **Settings Page**: Dedicated page at `/settings` for all user preferences

#### Enhanced User Experience

- **Toast Notifications**: All user messages (success/error) use `sonner` for non-intrusive toast notifications
- **Delete Functionality**:
  - Delete individual job applications
  - Delete entire columns (with all contained job applications)
- **Session Management**: Automatic session handling with secure cookies

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **UI**: ShadCN UI components, Tailwind CSS, Lucide React icons
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Better Auth (email/password)
- **File Storage**: Cloudinary for profile images
- **Drag & Drop**: @dnd-kit/core and @dnd-kit/sortable
- **Notifications**: Sonner for toast messages
- **Styling**: Tailwind CSS with custom theme support

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for profile image storage)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/job-tracker?retryWrites=true&w=majority

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Next.js
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

### Installation

1. Clone the repository:

```bash
git clone https://github.com/JoseRaul-TR/job-application-tracker.git
cd job-application-tracker
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables as shown above

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser

## Project Structure

```
job-application-tracker/
├── app/
│   ├── api/auth/[...all]/route.ts    # Better Auth API routes
│   ├── dashboard/page.tsx            # Main Kanban board
│   ├── settings/page.tsx            # User settings page
│   ├── sign-in/page.tsx             # Sign in page
│   └── sign-up/page.tsx             # Sign up page
├── components/
│   ├── navbar.tsx                   # Navigation bar
│   ├── settings-form.tsx            # Settings form component
│   ├── profile-image-section.tsx   # Profile picture upload
│   ├── delete-account-section.tsx   # Account deletion
│   ├── kanban-board.tsx             # Kanban board logic
│   ├── job-application-card.tsx     # Job application card
│   └── create-job-application-dialogue.tsx
├── lib/
│   ├── auth/
│   │   ├── auth.ts                  # Better Auth configuration
│   │   └── auth-client.ts           # Client-side auth helpers
│   ├── actions/
│   │   ├── user-profile.ts          # User profile actions
│   │   └── job-applications.ts      # Job application actions
│   └── db.ts                       # MongoDB connection
└── proxy.ts                        # Middleware for route protection
```

## Usage

### User Authentication

- Sign up with email and password
- Sign in to access your dashboard
- All protected routes redirect to sign-in if not authenticated

### Dashboard

- **Columns**: Create columns to organize job applications (e.g., "Applied", "Interview", "Offer")
- **Job Applications**: Drag and drop cards between columns
- **Create**: Click "Add Job" to create a new job application
- **Edit**: Click the edit button on a card to update details
- **Delete**: Click the delete button to remove a job application or entire column

### Settings

- **Profile Picture**: Click the camera icon to upload a new profile picture
- **Display Name**: Update your name in the settings form
- **Email**: Change your email address (password confirmation required)
- **Password**: Update your password
- **Delete Account**: Permanently delete your account and all data

## Screenshots

<img width="2940" height="2226" alt="image" src="https://github.com/user-attachments/assets/670c95ac-395d-4a6b-bb51-128e22b01740" />
<img width="2940" height="2818" alt="image" src="https://github.com/user-attachments/assets/8f2716cc-e97c-495b-8297-ae392e9e3b32" />
<img width="2940" height="1678" alt="image" src="https://github.com/user-attachments/assets/f996687d-8b85-40bf-b389-db6093367c86" />
<img width="2940" height="1678" alt="image" src="https://github.com/user-attachments/assets/8dfef310-25b2-4aad-9e4b-3c8fc30e1d95" />

## Known Bugs

### Email Update Issue

- **Description**: When attempting to update the user's email address in the Settings page, the application may throw a "Verification email isn't enabled" error.
- **Root Cause**: Better Auth's `changeEmail` API requires the email verification plugin to be properly configured. The current workaround enables the plugin but disables email sending.
- **Workaround**: The issue has been partially addressed by configuring the email verification plugin with a no-op email sender. However, email updates may still fail in certain edge cases.
- **Status**: ⚠️ Partially fixed - requires further investigation into Better Auth v1.x email change behavior

### Other Known Issues

- **SecurityError**: Rare security errors may occur during password changes in development mode due to cookie security settings. This is being addressed through improved cookie configuration.
- **Session Refresh**: After certain actions (like profile image upload), a page reload is triggered. This could be optimized to use React state updates instead.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://better-auth.com)
- [PedroTech Tutorial](https://www.youtube.com/watch?v=vCIsrOGNhas&t=19371s)
- [ShadCN UI](https://ui.shadcn.com)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Set up environment variables in Vercel
4. Deploy!

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
