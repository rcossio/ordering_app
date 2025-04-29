# Ordering App

A full-stack ordering application for cashiers and administrators, built with React, Node.js + Express, MongoDB, and Passport.js. The app allows managers to browse and manage categories, dishes, ingredients, and orders through a mobile-friendly cashier interface, while administrators can manage users.

## Table of Contents
- Features
- Tech Stack
- Architecture
- Getting Started
- Folder Structure
- API Endpoints
- Frontend Usage
- Testing
- Deployment
- Future Roadmap

## Features
- Browse categories and dishes
- Manage cart with live total, discounts, and tips
- Create and edit categories and dishes
- Seed basic categories: Food and Drinks
- User authentication for managers and admins
- Offline mode with sync

## Tech Stack
- Frontend: React, Axios, CSS
- Backend: Node.js, Express, Mongoose, Passport.js, express-session, cors
- Database: MongoDB (Atlas or local)

## Getting Started
1. Add `.env` in `server/` with `MONGO_URI`, `SESSION_SECRET`, and `PORT`.
2. Install dependencies in both `client/` and `server/`.
3. Run `npm start` in each folder.
4. Open `http://localhost:3000`.

## Folder Structure
```
ordering_app/
├── client/
└── server/
```

## API Endpoints
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/categories/:id/dishes`
- `POST /api/dishes`

## Frontend Usage & UX/UI Interaction
- **Cashier Web App (Mobile Design)**
  - Browse categories by scrolling or tapping the category list.
  - Dish cards display name, optional image or colored icon.
  - Tap a dish to add it to the cart; tap again to increment its quantity.
  - Tap a dish in the cart pane to remove one unit, or use the “-” button.
  - Cart pane (left side) shows a live subtotal, with input fields for manual discount and tip.
  - Confirm Order screen summarizes items, discount, tip, and final total before saving.
  - Offline support: cashier can continue adding orders when disconnected; data syncs when back online.

- **Admin Dashboard (Desktop)**
  - Simple user management: create/delete manager accounts, reset passwords via email link.
  - Authenticate with admin credentials stored in `.env`.

### Order Reporting & PDF Export
- Filter and generate reports for Today, This Week, Last Month, or Custom Date Range.
- Report includes:
  - Total ingredients needed across orders.
  - Estimated purchase cost based on ingredient prices.
  - Total dishes sold and Top 3 most sold dishes.
  - Total revenue for the period.
- View report in the browser and download it as a PDF for procurement planning.

## Deployment
Deploy to Railway by linking your GitHub repo and setting env vars.

*For detailed reports, ingredient management, and order history, see the project roadmap.*

## User Stories

These scenarios outline common cashier and manager workflows to verify the app’s features:

1. Cashier Order Flow
   - Cashier clicks two different dish cards in the **Cashier** tab to add each to the cart.
   - In the cart pane, cashier clicks the “–” button next to one item to remove it.
   - Cashier clicks **Confirm Order**, agrees in the confirmation dialog, and submits the order.
   - Switch to the **Orders** tab and verify the new order appears with correct date, subtotal, discount, tip, and total.

2. Immediate Menu Update
   - In the **Manage** tab, manager uses the **Create Dish** form to add a new dish under a selected category.
   - Switch to the **Cashier** tab, and the new dish card appears automatically in its category.
   - In the cart pane, apply a discount and a tip using the labeled inputs.
   - Confirm the order and verify discount and tip are applied correctly in the **Orders** tab.

3. Edit and Delete Dishes
   - In the **Manage** tab, manager clicks an existing dish card to open the **Edit Dish** modal.
   - In the modal, update the dish’s price and select a different category, then click **Save**.
   - Verify the dish card moves to the new category with updated price.
   - Click another dish card, open the modal, and click **Delete** in the confirmation dialog.
   - Verify the deleted dish no longer appears in any category list.

*These user stories can be run end-to-end to fully validate both frontend and backend integrations.*