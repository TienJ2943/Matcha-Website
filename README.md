# Matcha Website

## Project Summary

This Website is a full-stack e-commerce web application designed for users to browse themed products, view product details, and add items to a shopping cart in a simple and visually appealing interface. The website solves the problem of presenting a small online store in a structured and interactive way, combining a styled frontend with backend product data. It demonstrates how a shopping website can connect user-facing pages with API-based data and cart functionality. The project also serves as a practical example of building a modern web application using React and Node.js.

## Technical Stack

### Frontend
- React
- Vite

### Styling
- CSS
- Custom fonts
- Local image assets

### Routing
- React Router

### Data
- Product data fetched from a backend API
- Cart data managed through React Context

### Backend
- Node.js
- Express

### Deployment
- Not deployed yet / local development environment only

## Features

- Product listing page
- Product detail page
- Add to cart functionality
- Dynamic product fetching from backend API
- Custom themed styling
- Navigation bar for page routing
- Cart state management using React Context
- Support for local images and custom fonts
- Responsive card-based layout

## Folder Structure

```bash
Matcha-Website/
├── backend/              # Express server and API logic
├── frontend/             # React frontend application
│   ├── public/           # Static files such as fonts and images
│   ├── src/
│   │   ├── pages/        # Page components such as Home, Products, Cart
│   │   ├── assets/       # Frontend assets
│   │   ├── App.jsx       # Main app component
│   │   ├── App.css       # Main styling
│   │   ├── index.css     # Global styling
│   │   └── CartContext.jsx   # Cart state management
│   └── package.json
└── README.md

Challenges Overcome

One challenge in this project was linking the React frontend with the backend API and making sure product data loaded correctly through fetch requests. Another challenge was troubleshooting CSS issues, such as centering components, styling links as buttons, and making sure custom fonts and local image assets displayed properly. Routing between product pages and other sections of the website also required careful setup with React Router. Cart functionality involved managing shared state across components, which was addressed using React Context. Overall, the project helped strengthen both debugging skills and understanding of full-stack integration.

Future Improvements
Product search and filtering
Quantity selector in cart
Remove from cart functionality
Checkout page
User login and authentication
Deployment to an online hosting platform
