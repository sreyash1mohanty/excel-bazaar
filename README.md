# ExcelBazaar[Social Calc Modern Version]

## Tasks Accomplished

- [x] **Task 1:** Completed the integration of real-time collaboration using `Socket.io`.
- [x] **Task 2:** Implemented user authentication and authorization using JWT tokens.
- [x] **Task 3** Implemented basic spreadsheet functionalities such as filter sort import/export bold/italic zoom in zoom out.
- [x] **Task 4:** Enabled data persistence using MongoDB and MongoDB Atlas.

## Technology Stack

This project leverages the following technologies:

- **[React](https://reactjs.org/):** Chosen for building the frontend due to its component-based architecture, which allows for efficient UI updates and reusability.
- **[Express](https://expressjs.com/):** A minimalist web framework for Node.js, used for building the backend API due to its simplicity and flexibility.
- **[Node.js](https://nodejs.org/):** Used as the runtime environment for server-side code, enabling the use of JavaScript across the entire stack.
- **[MongoDB](https://www.mongodb.com/):** A NoSQL database chosen for its scalability and ability to handle large volumes of unstructured data.
- **[JWT](https://jwt.io/):** Utilized for secure user authentication and authorization, ensuring that only authorized users can access certain features.
- **[react-spreadsheet](https://github.com/iddan/react-spreadsheet):** Used to implement the spreadsheet layout, offering a simple yet flexible way to manage and display tabular data.
- **[Socket.io](https://socket.io/):** Enables real-time, bidirectional communication between clients and servers, used here for collaborative editing features.
- **[Docker](https://www.docker.com/):** Provides containerization capabilities, making the application easy to deploy on various platforms, including AWS.
- **[AWS](https://aws.amazon.com/):** Chosen for its reliable and scalable cloud computing services, used to deploy the application.

## Key Features

- **Real-Time Collaboration:** Multiple users can edit the spreadsheet simultaneously, with changes reflected in real-time.
- **User Authentication & Authorization:** Secure login and access control using JWT tokens.
- **Data Persistence:** Ensures that user data is stored and managed effectively using MongoDB and MongoDB Atlas.
- **Spreadsheet Functionalities:** Includes editing cells, sorting, filtering, and importing/exporting data.
- **Scalable Architecture:** Built as a scalable monolith, using best practices to ensure maintainability and performance.

## Local Setup Instructions

Follow these steps to run the project locally on both Windows and macOS:

### Prerequisites

Ensure you have the following installed:

- Node.js (https://nodejs.org/)
- MongoDB (https://www.mongodb.com/)
- Docker (Optional, for containerization)

### Clone the Repository

1. **Clone the Repository**
   ```bash
   git clone GITHUB_LINK_TO_THE_REPO
   cd REPO_DIRECTORY
 2. **Go to the backend  and frontend directory**
   ```bash
   cd backend
   npm install
   cd frontend
   npm install
MONGO_URI=your_mongo_db_uri
JWT_SECRET=your_jwt_secret

