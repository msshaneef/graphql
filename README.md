# 🌐 Web Application with GraphQL, JWT Authentication, and Data Visualization

This project is a recreation of the @Talent dashboard system of the Reboot01 school. It uses GraphQL queries for a dynamic dashboard and SVG charts from the GraphQL data. The web application demonstrates user authentication, data visualization, and interaction with a GraphQL API. It includes features such as JWT-based authentication, progress bars, and radar charts.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## 🌐 Hosting

This project is hosted at [https://graphql-alpha-two.vercel.app/](https://graphql-alpha-two.vercel.app/).

## 📋 Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Learning Outcome](#learning-Outcome)

## ✨ Features

- 🔒 User authentication using JWT
- 📊 Data visualization with D3.js
- 🌗 Responsive design with light and dark themes
- 🚀 Interaction with a GraphQL API
- 📈 Progress tracking and display

## 🛠 Technologies Used

- 🖥 CSS, JavaScript, Next.js, React
- 📈 D3.js for data visualization
- 🕸 GraphQL for API interaction
- 🔑 JWT for authentication
- 🍪 `js-cookie` for handling cookies

## ⚙️ Setup and Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2. Install dependencies:
    ```sh
    npm install
    ```
3. Run the development server:
    ```bash
    npm run dev
    ```

## Getting Started

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 🔑 Login

1. Enter your username/email and password.
2. On successful login, you will be redirected to [`dashboard.html`].


### 📊 Dashboard

- The dashboard displays various data visualizations including progress bars and radar charts.
- You can log out by clicking the logout button, which will clear the JWT cookie and redirect you to the login page.

## 🎯 Learning Outcome

- 🕸 GraphQL
- 🛠 GraphiQL
- 🌐 Hosting
- 🔑 JWT
- 🔒 Authentication
- 🔐 Authorization
- 🖥 UI/UX
