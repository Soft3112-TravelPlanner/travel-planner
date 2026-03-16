# Travel Planner - MVP Epic & Use Case Plan

> **Project:** Travel Planner Web Application
> **Course:** SOFT3112 - Software Development Practice (Isik University)
> **Tech Stack:** React | Node.js | MySQL
> **Approach:** MVP (Minimum Viable Product)

---

## Team Structure

| Role                  | Count | Notes                             |
| --------------------- | ----- | --------------------------------- |
| Business Analysts     | 3     | Almost no prior experience        |
| Frontend Developers   | 6     | 2 strong, 2 average, 2 weak      |
| Backend Developers    | 4     | 1 strong, 3 weak                 |
| Testers               | 3     | 1 experienced, 2 inexperienced   |
| DevOps + Architect    | 1     | Also acts as a tester             |
| **Total**             | **17**|                                   |

---

## MVP Scope Principles

| Principle                       | Decision                                                                 |
| ------------------------------- | ------------------------------------------------------------------------ |
| No live API integrations        | Accommodation & transportation come from admin-seeded database           |
| No AI/ML                        | Travel mood is a simple filter, not a recommendation engine              |
| No payment processing           | Users "save" bookings to trips, not purchase them                        |
| No real-time features           | No chat, no WebSockets, no push notifications                            |
| Simple authentication           | Email/password with JWT -- no OAuth/social login                         |
| Two roles only                  | User and Admin                                                           |
| Static content                  | Destinations, attractions, accommodations, transport are admin-managed   |
| No mobile app                   | Web only (responsive design)                                             |

### Intentionally Excluded from MVP

- Social features (comments, reviews, user-generated content)
- Multi-currency / exchange rate calculations
- Real-time weather API integration
- Collaborative trip editing (multi-user on same trip)
- Budget tracker / expense splitting
- Map integration (Google Maps / Leaflet) -- can be a future enhancement
- Email notifications beyond password reset
- PDF/print export of itineraries

---

## Epic Overview

| #   | Epic                                | UC Count | Priority |
| --- | ----------------------------------- | -------- | -------- |
| E1  | User Authentication & Profile       | 5        | Sprint 1 |
| E2  | Trip Management                     | 6        | Sprint 2 |
| E3  | Destination Discovery               | 5        | Sprint 2 |
| E4  | Itinerary Builder                   | 5        | Sprint 3 |
| E5  | Accommodation Search & Save         | 4        | Sprint 3 |
| E6  | Transportation Search & Save        | 4        | Sprint 3 |
| E7  | Travel Preparation Checklist        | 4        | Sprint 4 |
| E8  | Admin Panel                         | 4        | Sprint 1-2 |
|     | **Total**                           | **37**   |          |

---

## E1 - User Authentication & Profile

**Description:** Users can register, log in, manage their profile, and securely access the application. Foundation for all other epics.

**Business Value:** No platform feature works without user identity and session management.

**Key Features:**
- User registration (email + password)
- Login / Logout with JWT sessions
- Password reset via email
- Profile management (name, avatar, travel preferences)

---

### UC-1: Register a New Account

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Visitor (unregistered user)                                  |
| **Precondition** | User is not logged in                                        |
| **Trigger**      | User clicks "Sign Up"                                       |

**Main Flow:**
1. User navigates to the registration page.
2. User enters: name, email address, and password.
3. System validates inputs (email format, password min. length).
4. System creates the account and stores hashed password.
5. System displays a success message and redirects to the login page.

**Postcondition:** A new user account exists in the database.

**Alternative Flows:**
- **A1 - Email already exists:** System displays "Email already registered" error.
- **A2 - Validation failure:** System highlights invalid fields with error messages.

---

### UC-2: Log In

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Registered User                                              |
| **Precondition** | User has a valid account                                     |
| **Trigger**      | User clicks "Log In"                                        |

**Main Flow:**
1. User enters email and password on the login page.
2. System validates credentials against the database.
3. System creates a JWT session token.
4. System redirects user to the dashboard (My Trips page).

**Postcondition:** User is authenticated and has access to protected features.

**Alternative Flows:**
- **A1 - Invalid credentials:** System displays "Invalid email or password" error.

---

### UC-3: Log Out

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | User is logged in                                            |
| **Trigger**      | User clicks "Log Out"                                       |

**Main Flow:**
1. User clicks the "Log Out" button.
2. System invalidates/removes the JWT token on the client.
3. System redirects user to the landing page.

**Postcondition:** User session is terminated; protected pages are inaccessible.

---

### UC-4: View and Edit Profile

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | User is logged in                                            |
| **Trigger**      | User clicks "My Profile"                                    |

**Main Flow:**
1. User navigates to the profile page.
2. System displays current profile information (name, email, avatar URL, travel preferences).
3. User clicks "Edit", modifies desired fields.
4. User clicks "Save".
5. System validates the changed data and updates the database.

**Postcondition:** Profile is updated.

**Alternative Flows:**
- **A1 - Validation failure:** System shows error messages for invalid fields.

---

### UC-5: Reset Password

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Registered User                                              |
| **Precondition** | User has an account but forgot the password                  |
| **Trigger**      | User clicks "Forgot Password" on the login page             |

**Main Flow:**
1. User clicks "Forgot Password".
2. User enters their registered email.
3. System sends a password reset link via email (with a time-limited token).
4. User clicks the link and enters a new password.
5. System validates the token, hashes the new password, and updates it.
6. System redirects user to the login page with a success message.

**Postcondition:** User can log in with the new password.

**Alternative Flows:**
- **A1 - Email not found:** System displays "If this email exists, a reset link has been sent" (no information leak).
- **A2 - Token expired:** System displays "Reset link has expired, please request a new one."

---

## E2 - Trip Management

**Description:** Users can create, view, edit, and delete trips. A trip is the central entity that groups destinations, itineraries, accommodation, transportation, and checklists.

**Business Value:** The trip is the main organizational unit of the entire application.

**Key Features:**
- Create/edit/delete trips
- Trip list overview
- Trip detail dashboard
- Share trip via read-only link

---

### UC-6: Create a New Trip

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | User is logged in                                            |
| **Trigger**      | User clicks "Create New Trip"                               |

**Main Flow:**
1. User clicks "Create New Trip" button.
2. System displays a form with fields: trip name, destination (select from available destinations), start date, end date, travel mood (optional: adventure, relaxation, cultural, romantic, family).
3. User fills in the fields and clicks "Create".
4. System validates inputs (e.g., end date >= start date).
5. System saves the trip and redirects to the trip detail page.

**Postcondition:** A new trip exists in the database and appears in the user's trip list.

**Alternative Flows:**
- **A1 - Validation error:** System highlights invalid fields.

---

### UC-7: View Trip List

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | User is logged in                                            |
| **Trigger**      | User navigates to "My Trips"                                |

**Main Flow:**
1. User clicks "My Trips" in the navigation.
2. System displays a list/grid of all the user's trips showing: trip name, destination, dates, and status (upcoming / in progress / past).

**Postcondition:** User sees an overview of all their trips.

---

### UC-8: View Trip Details

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Trip exists and belongs to the user                          |
| **Trigger**      | User clicks on a trip from the list                         |

**Main Flow:**
1. User clicks on a trip card/row.
2. System displays the trip dashboard with tabs/sections:
   - Overview (destination info, dates, mood)
   - Itinerary (day-by-day plan)
   - Accommodations (saved listings)
   - Transportation (saved options)
   - Checklist (preparation items)

**Postcondition:** User sees the complete trip details.

---

### UC-9: Edit a Trip

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Trip exists and belongs to the user                          |
| **Trigger**      | User clicks "Edit" on trip details                          |

**Main Flow:**
1. User clicks "Edit Trip" on the trip detail page.
2. System displays the trip form pre-filled with current values.
3. User modifies trip name, destination, dates, or travel mood.
4. User clicks "Save".
5. System validates and updates the trip.

**Postcondition:** Trip is updated in the database.

---

### UC-10: Delete a Trip

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Trip exists and belongs to the user                          |
| **Trigger**      | User clicks "Delete Trip"                                   |

**Main Flow:**
1. User clicks "Delete Trip".
2. System displays a confirmation dialog: "Are you sure? This will delete the trip and all associated data."
3. User confirms deletion.
4. System deletes the trip and all associated itinerary items, saved accommodations, saved transportation, and checklist items.
5. User is redirected to the trip list.

**Postcondition:** Trip and all related records are permanently removed.

**Alternative Flows:**
- **A1 - User cancels:** Dialog closes, no changes.

---

### UC-11: Share a Trip (View-Only Link)

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Trip exists                                                  |
| **Trigger**      | User clicks "Share Trip"                                    |

**Main Flow:**
1. User clicks "Share Trip" on the trip detail page.
2. System generates a unique shareable URL (or returns existing one).
3. User copies the link.
4. Anyone with the link can view the trip details in read-only mode without logging in.

**Postcondition:** A read-only public view of the trip is accessible via the link.

---

## E3 - Destination Discovery

**Description:** Users can browse, search, and explore destinations and their attractions. Content is managed by admins.

**Business Value:** Helps users discover where to go and what to do -- differentiates the platform from a simple calendar.

**Key Features:**
- Browse/search destinations
- Destination detail pages with attractions
- Save destinations to favorites

---

### UC-12: Browse Destinations

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Any User (authenticated or visitor)                          |
| **Precondition** | Destinations exist in the database                           |
| **Trigger**      | User navigates to "Discover" / "Destinations"               |

**Main Flow:**
1. User opens the destinations page.
2. System displays a paginated list/grid of destinations with: name, country, image, and short description.
3. User can scroll/paginate through results.

**Postcondition:** User sees available destinations.

---

### UC-13: Search and Filter Destinations

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Any User                                                     |
| **Precondition** | Destinations exist in the database                           |
| **Trigger**      | User types in the search bar or applies filters              |

**Main Flow:**
1. User types a keyword (city name, country) in the search bar.
2. Optionally applies filters: continent, travel type, budget range.
3. System returns matching destinations.
4. Results update in the list/grid.

**Postcondition:** Filtered destination list is displayed.

**Alternative Flows:**
- **A1 - No results:** System displays "No destinations found" message.

---

### UC-14: View Destination Details

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Any User                                                     |
| **Precondition** | Destination exists in the database                           |
| **Trigger**      | User clicks on a destination card                           |

**Main Flow:**
1. User clicks on a destination.
2. System displays a detail page with: description, top attractions, restaurants, average weather summary, currency, and language.
3. Attractions are listed with name, type, short description, and image.

**Postcondition:** User sees comprehensive destination information.

---

### UC-15: View Attraction Details

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Any User                                                     |
| **Precondition** | Attraction exists for a destination                          |
| **Trigger**      | User clicks on an attraction from the destination page      |

**Main Flow:**
1. User clicks on an attraction listed on the destination detail page.
2. System displays attraction details: name, category (landmark, restaurant, activity), description, image, and location info.

**Postcondition:** User sees full attraction details.

---

### UC-16: Save/Remove a Destination to/from Favorites

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | User is logged in                                            |
| **Trigger**      | User clicks the heart/bookmark icon on a destination        |

**Main Flow:**
1. User clicks the "Favorite" icon on a destination card or detail page.
2. System adds the destination to the user's favorites list.
3. Icon state changes to "favorited."

**Postcondition:** Destination appears in the user's favorites.

**Alternative Flows:**
- **A1 - Already favorited:** Clicking again removes it from favorites (toggle).

---

## E4 - Itinerary Builder

**Description:** Users can plan daily activities within a trip by creating a day-by-day itinerary with time-slotted activities.

**Business Value:** Core planning feature -- transforms a trip from a date range into an actionable day-by-day plan.

**Key Features:**
- Day-by-day itinerary view
- Add/edit/delete activities per day
- Reorder activities via drag-and-drop

---

### UC-17: View Itinerary for a Trip

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Trip exists                                                  |
| **Trigger**      | User opens a trip and navigates to the "Itinerary" tab      |

**Main Flow:**
1. User opens the itinerary tab within a trip.
2. System displays a day-by-day timeline (Day 1, Day 2, ...) based on trip start/end dates.
3. Each day shows its activities listed in order with time and name.

**Postcondition:** User sees the full itinerary.

---

### UC-18: Add an Activity to a Day

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Trip exists                                                  |
| **Trigger**      | User clicks "Add Activity" on a specific day                |

**Main Flow:**
1. User selects a day in the itinerary.
2. User clicks "Add Activity".
3. System displays a form with fields: activity name, time, location (free text), notes (optional).
4. User fills in the form and clicks "Save".
5. System saves the activity and it appears under the selected day.

**Postcondition:** Activity is added to the day's schedule.

---

### UC-19: Edit an Activity

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Activity exists in the itinerary                             |
| **Trigger**      | User clicks on an existing activity                         |

**Main Flow:**
1. User clicks on an activity.
2. System displays the activity form pre-filled with current values.
3. User modifies the fields (name, time, location, notes).
4. User clicks "Save".
5. System updates the activity.

**Postcondition:** Activity is updated.

---

### UC-20: Delete an Activity

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Activity exists in the itinerary                             |
| **Trigger**      | User clicks "Delete" on an activity                         |

**Main Flow:**
1. User clicks the delete button on an activity.
2. System asks for confirmation.
3. User confirms.
4. System removes the activity from the day.

**Postcondition:** Activity is removed from the itinerary.

---

### UC-21: Reorder Activities within a Day

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Day has multiple activities                                  |
| **Trigger**      | User drags an activity to a new position                    |

**Main Flow:**
1. User drags an activity card to a different position within the same day.
2. System updates the display order.
3. New order is saved to the database.

**Postcondition:** Activities are displayed in the new order.

---

## E5 - Accommodation Search & Save

**Description:** Users can browse accommodation listings for their destinations and save them to trips. Data is admin-seeded (no live booking API).

**Business Value:** Completes the travel planning workflow -- users need somewhere to stay.

**Key Features:**
- Search/filter accommodations by destination
- View accommodation details
- Save/remove accommodation to/from a trip

---

### UC-22: Search Accommodations by Destination

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | User is within a trip or browsing a destination              |
| **Trigger**      | User navigates to "Accommodations" section                  |

**Main Flow:**
1. User navigates to accommodations for a destination.
2. System displays a list of accommodation listings.
3. User can optionally filter by: type (hotel, hostel, apartment), price range, rating.
4. Results update accordingly.

**Postcondition:** User sees accommodation options for the destination.

**Alternative Flows:**
- **A1 - No results:** System displays "No accommodations found" message.

---

### UC-23: View Accommodation Details

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Accommodation listing exists                                 |
| **Trigger**      | User clicks on an accommodation card                        |

**Main Flow:**
1. User clicks on an accommodation listing.
2. System displays: name, description, price per night, type, amenities, rating, images, and location.

**Postcondition:** User sees full accommodation details.

---

### UC-24: Save Accommodation to a Trip

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Trip exists, accommodation listing exists                    |
| **Trigger**      | User clicks "Add to Trip" on an accommodation               |

**Main Flow:**
1. User clicks "Add to Trip" on an accommodation listing.
2. If user has multiple trips for this destination, system asks which trip.
3. System links the accommodation to the selected trip.
4. Confirmation message is shown.

**Postcondition:** Accommodation is saved under the trip and visible in the trip's "Accommodations" section.

---

### UC-25: Remove Accommodation from a Trip

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Accommodation is linked to a trip                            |
| **Trigger**      | User clicks "Remove" on a saved accommodation               |

**Main Flow:**
1. User opens a trip's accommodations section.
2. User clicks "Remove" on a saved accommodation.
3. System unlinks the accommodation from the trip.

**Postcondition:** Accommodation is no longer associated with the trip.

---

## E6 - Transportation Search & Save

**Description:** Users can browse transportation options (flights, buses, trains) and save them to trips. Data is admin-seeded (no live booking API).

**Business Value:** Completes the travel logistics -- getting to the destination is the first thing users plan.

**Key Features:**
- Search/filter transportation by route
- View transportation details
- Save/remove transportation to/from a trip

---

### UC-26: Search Transportation Options

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | User is within a trip or browsing                            |
| **Trigger**      | User navigates to "Transportation" section                  |

**Main Flow:**
1. User navigates to transportation for a trip.
2. User enters: origin, destination, and travel date.
3. System displays matching options (flight, bus, train) with: price, duration, departure/arrival time, and carrier.
4. User can optionally filter by: transport type, price range, departure time.

**Postcondition:** User sees transportation options.

**Alternative Flows:**
- **A1 - No results:** System displays "No transportation found" message.

---

### UC-27: View Transportation Details

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Transportation listing exists                                |
| **Trigger**      | User clicks on a transportation option                      |

**Main Flow:**
1. User clicks on a transportation listing.
2. System displays: carrier name, departure/arrival times, duration, price, transport type, class, and number of stops.

**Postcondition:** User sees full transportation details.

---

### UC-28: Save Transportation to a Trip

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Trip exists, transportation listing exists                   |
| **Trigger**      | User clicks "Add to Trip" on a transportation option        |

**Main Flow:**
1. User clicks "Add to Trip" on a transportation option.
2. System links the transportation to the trip.
3. Confirmation message is shown.

**Postcondition:** Transportation is saved under the trip and visible in the trip's "Transportation" section.

---

### UC-29: Remove Transportation from a Trip

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Transportation is linked to a trip                           |
| **Trigger**      | User clicks "Remove" on a saved transportation option       |

**Main Flow:**
1. User opens a trip's transportation section.
2. User clicks "Remove" on a saved transportation option.
3. System unlinks the transportation from the trip.

**Postcondition:** Transportation is no longer associated with the trip.

---

## E7 - Travel Preparation Checklist

**Description:** Users get a checklist to prepare for their trip. System provides default items; users can add custom items and track progress.

**Business Value:** Adds practical value beyond planning -- ensures users don't forget important preparation steps.

**Key Features:**
- View checklist with suggested items
- Add custom checklist items
- Toggle item completion
- Overall progress indicator

---

### UC-30: View Preparation Checklist for a Trip

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Trip exists                                                  |
| **Trigger**      | User opens the "Checklist" tab within a trip                |

**Main Flow:**
1. User navigates to the "Checklist" tab in a trip.
2. System displays a list of preparation items with checkboxes.
3. System auto-populates default items based on destination (e.g., "Check passport validity", "Get travel insurance", "Book accommodation", "Pack essentials").
4. A progress bar/percentage shows overall completion.

**Postcondition:** User sees the checklist with completion status.

---

### UC-31: Add a Custom Checklist Item

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Trip exists                                                  |
| **Trigger**      | User clicks "Add Item" on the checklist                     |

**Main Flow:**
1. User clicks "Add Item".
2. User types a custom checklist item (free text).
3. User clicks "Save" / presses Enter.
4. System adds the item to the checklist (unchecked).

**Postcondition:** Custom item appears in the checklist.

---

### UC-32: Toggle Checklist Item Completion

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | Checklist item exists                                        |
| **Trigger**      | User clicks the checkbox next to an item                    |

**Main Flow:**
1. User clicks the checkbox on a checklist item.
2. System toggles the item between checked (complete) and unchecked (incomplete).
3. Progress bar/percentage updates accordingly.

**Postcondition:** Item status is updated; progress reflects the change.

---

### UC-33: Delete a Checklist Item

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Authenticated User                                           |
| **Precondition** | A custom checklist item exists                               |
| **Trigger**      | User clicks "Delete" on a checklist item                    |

**Main Flow:**
1. User clicks the delete button on a checklist item.
2. System removes the item from the checklist.
3. Progress bar updates accordingly.

**Postcondition:** Item is removed from the checklist.

---

## E8 - Admin Panel

**Description:** Admin users can manage platform content (destinations, attractions, accommodations, transportation) and view basic platform statistics.

**Business Value:** Enables content management without direct database access -- essential for populating seed data and demoing the product.

**Key Features:**
- Role-based admin access
- CRUD for destinations, attractions, accommodations, and transportation
- Basic platform statistics dashboard

---

### UC-34: Admin Login (Role-Based Routing)

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Admin                                                        |
| **Precondition** | Admin account exists (pre-seeded or created by DevOps)       |
| **Trigger**      | Admin logs in via the standard login form                    |

**Main Flow:**
1. Admin enters credentials on the login page (same form as regular users).
2. System validates credentials.
3. System detects the "admin" role on the user record.
4. System redirects to the admin dashboard instead of the user dashboard.

**Postcondition:** Admin has access to the admin panel.

**Alternative Flows:**
- **A1 - Regular user:** System redirects to the normal user dashboard.

---

### UC-35: Manage Destinations and Attractions (CRUD)

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Admin                                                        |
| **Precondition** | Admin is logged in                                           |
| **Trigger**      | Admin navigates to "Manage Destinations"                    |

**Main Flow:**
1. Admin opens the destinations management page.
2. System displays a table/list of all destinations.
3. Admin can:
   - **Create:** Click "Add Destination" → fill in name, country, description, image URL, weather summary, currency, language → Save.
   - **Read:** View destination details and its associated attractions.
   - **Update:** Click "Edit" → modify fields → Save.
   - **Delete:** Click "Delete" → confirm → destination is removed.
4. For each destination, admin can also manage attractions:
   - Add/edit/delete attractions (name, category, description, image URL).

**Postcondition:** Destination and attraction data is updated in the database.

---

### UC-36: Manage Accommodations and Transportation (CRUD)

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Admin                                                        |
| **Precondition** | Admin is logged in                                           |
| **Trigger**      | Admin navigates to "Manage Accommodations" or "Manage Transportation" |

**Main Flow:**
1. Admin opens the accommodation or transportation management page.
2. System displays a table/list of existing entries.
3. Admin can:
   - **Create:** Click "Add" → fill in required fields → Save.
     - Accommodation: name, destination, type, price per night, amenities, rating, description, image URL.
     - Transportation: carrier, origin, destination, departure/arrival times, price, type, class, stops.
   - **Read:** View listing details.
   - **Update:** Click "Edit" → modify fields → Save.
   - **Delete:** Click "Delete" → confirm → entry is removed.

**Postcondition:** Accommodation or transportation data is updated in the database.

---

### UC-37: View Basic Platform Statistics

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Actor**        | Admin                                                        |
| **Precondition** | Admin is logged in                                           |
| **Trigger**      | Admin navigates to the admin dashboard                      |

**Main Flow:**
1. Admin opens the admin dashboard (landing page after admin login).
2. System displays basic statistics:
   - Total registered users
   - Total trips created
   - Most popular destinations (by number of trips)
   - Total accommodations and transportation entries in the system

**Postcondition:** Admin sees a platform usage overview.

---

## Epic Dependency Map

```
E1 (User Auth) ← Foundation for all other epics
├── E2 (Trip Management)      ← Depends on E1
├── E3 (Destination Discovery) ← Partially independent (guests can browse)
├── E4 (Itinerary Builder)    ← Depends on E1, E2
├── E5 (Accommodation)        ← Depends on E1, E2, E3
├── E6 (Transportation)       ← Depends on E1, E2
├── E7 (Checklist)            ← Depends on E1, E2
└── E8 (Admin Panel)          ← Depends on E1 (admin role)
```

## Suggested Sprint Plan

| Sprint   | Epics                                     | Rationale                                              |
| -------- | ----------------------------------------- | ------------------------------------------------------ |
| Sprint 1 | E1 (Auth) + E8 (Admin - basic structure)  | Foundation: auth + ability to seed content              |
| Sprint 2 | E2 (Trip Mgmt) + E3 (Destinations)        | Core entities: trips and destinations                   |
| Sprint 3 | E4 (Itinerary) + E5 (Accommodation) + E6 (Transport) | Planning and logistics features                |
| Sprint 4 | E7 (Checklist) + polish + integration testing | Final feature + quality assurance                    |

## Team Allocation Suggestions

| Role                  | Suggested Focus                                                   |
| --------------------- | ----------------------------------------------------------------- |
| 2 Strong FE Devs      | Itinerary builder (E4), Trip dashboard (E2), complex UI           |
| 2 Average FE Devs     | Destination pages (E3), Accommodation/Transport search (E5, E6)   |
| 2 Weak FE Devs        | Checklist (E7), Admin panel UI (E8), static/simple pages          |
| 1 Strong BE Dev       | Auth system (E1), Trip/Itinerary APIs (E2, E4), DB schema design  |
| 3 Weak BE Devs        | Simple CRUD APIs (E3, E5, E6, E7, E8), seed data setup           |
| 3 Business Analysts   | User stories, acceptance criteria, RAD/SDD/ODD documents          |
| 1 Experienced Tester  | Test strategy, critical path testing (auth, trip, itinerary)      |
| 2 Inexperienced Testers | UI testing, form validation, exploratory testing                |
| 1 DevOps + Architect  | CI/CD pipeline, deployment, DB setup, architecture review         |

---

## Appendix: Trello Board Structure

```
Board: Travel Planner - MVP Backlog

Lists (one per Epic):
  [E1] Auth & Profile        → Cards: UC-1, UC-2, UC-3, UC-4, UC-5
  [E2] Trip Management       → Cards: UC-6, UC-7, UC-8, UC-9, UC-10, UC-11
  [E3] Destination Discovery → Cards: UC-12, UC-13, UC-14, UC-15, UC-16
  [E4] Itinerary Builder     → Cards: UC-17, UC-18, UC-19, UC-20, UC-21
  [E5] Accommodation         → Cards: UC-22, UC-23, UC-24, UC-25
  [E6] Transportation        → Cards: UC-26, UC-27, UC-28, UC-29
  [E7] Checklist             → Cards: UC-30, UC-31, UC-32, UC-33
  [E8] Admin Panel           → Cards: UC-34, UC-35, UC-36, UC-37

Each Trello card should contain:
  - Title:       "UC-## — Use Case Name"
  - Description: Actor, Precondition, Main Flow (numbered steps), Postcondition, Alt Flows
  - Labels:      One color per Epic (e.g., E1=Blue, E2=Green, E3=Yellow, etc.)
  - Checklist:   Acceptance criteria derived from main flow steps
```

---

## Appendix: Trello Power-Up / Import Tool Recommendation

### Recommended: Placker (Power-Up)

- **URL:** https://placker.com
- Imports from **Google Sheets / Excel** directly into Trello
- Supports hierarchical structures (Epic → Use Cases)
- Free tier available -- suitable for a student project

### How to import:

1. Copy the 37 Use Cases into a **Google Sheet** with columns:
   - `Card Name` | `List Name` | `Description` | `Labels`
2. Install the **Placker** Power-Up from the Trello Power-Ups marketplace.
3. Use Placker's import feature to bulk-create all 37 cards into the correct lists.
4. Add **colored labels** per Epic.
5. Manually add checklists for acceptance criteria on each card.

### Alternative Options:

| Tool                    | Type         | Description                                              |
| ----------------------- | ------------ | -------------------------------------------------------- |
| **Trello CSV Import**   | Built-in     | Trello natively supports importing from CSV files        |
| **Import2 for Trello**  | Power-Up     | Bulk card creation from CSV with field mapping           |
| **Butler**              | Built-in     | Trello's automation tool for card movement rules         |

### Butler Automation Tips (post-import):

- **Rule:** When all checklist items on a card are complete → move card to "Done" list
- **Rule:** When a card is moved to "In Progress" → assign the current date as the start date
- **Card Button:** "Mark as blocked" → adds a red label and moves to a "Blocked" list
