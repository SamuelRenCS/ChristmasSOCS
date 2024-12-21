# ChristmasSOCS

COMP 307 Final Project for SOCS Competition

## How to run the project

1. To run our project, ssh into the following mimi account with the given key: cs307-user@fall2024-comp307-group12.cs.mcgill.ca

2. You will find the project in the following directory: ~/ChristmasSOCS. cd into this directory.

3. Go into the client directory and run the following command:

```bash
npm run build
```

This will build the client side React app. All packages should be installed already.

3. Now cd into the server directory under the project directory (~/ChristmasSOCS/server) and run the following command:

```bash
npm run start
```

4. You should now be able to access the website at the following URL: http://fall2024-comp307-group12.cs.mcgill.ca:5000/

Make sure to access the website through http and not https.

## Project Contributions

| Name             | Student ID | Contributions                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shotaro Nakamura | 261116957  | Front-end React styling and component creation for multiple pages, including Landing Page, Login Page, Registration Page and most of the Dashboard pages. Refactoring of multiple components to achieve responsive design.                                                                                                                                                                                                                                                       |
| Samuel Ren       | 261117713  | Front-end React styling and component creation for multiple pages, including Create Meeting Page, Create Request Page, Error Page, and the header and footer components. Routing and Authentication for the React SPA. Backend API integration for authentication, requests, and notifications. Front-end validations for POST requests. Schema design for request and notification. Clean-up of the front-end and backend file system, grouping api calls into separate routes. |
| Eric Cheng       | 261119519  | Backend API integration for booking, meeting, and dashboard. Worked on front-end React hooks and state management for the Create Booking Page, Create Meeting Page and View Meeting Page. Backend validations for POST requests. Schema design for booking, meeting, and user data.                                                                                                                                                                                              |

## What's next for ChristmasSOCS

1. Implementing a polling feature for members to allow users to vote on the best time for a meeting.

2. Further modularizing the front-end and back-end code to make it more maintainable and scalable, especially for time zones handling.

3. Better UI/UX design for the dashboard.
