_Disclamar: Project was abandoned rendering the project possibly un-runnable_

## Introduction

This project is a Web API for the backend of Vidly, an imaginary movie rental service.<br>
Tech stack: Javascript, Node, ExpressJs, MongoDB, Joi<br>
Development duration: Dec 12 - Jan 8<br>

### Features

- CRUD operations
- Authentication (basic/local)
- Authorization (roles, claims)
- Refresh token rotation
- Sorting, Filtering and Pagination 
- Spaghetti code ^_^

### Table of Contents

- [API Overview](#api)
- [Getting Started](#getting-started)
- [Running the API - Development](#running-in-development)
- [Running the API - Production](#running-in-production)


## Getting Started

### Prerequisities

To run this application, you need to have installed the listed softwares below.
- Node version 14+ @ https://nodejs.org/en/download/
- MongoDB version 6+ @ https://docs.mongodb.com/manual/installation/

### Installation

Step 1: Clone the repo:

```bash
git clone https://github.com/oghenetefa/vidly-movie-rentals-api-js
```

Step 2: Navigate into the cloned repo directory via a terminal and install dependencies:

```bash
npm install
```

Step 3: Duplicate the '_.env.example_' file and rename it to '_.env_'.

```diff
  project_folder/
    package.json
    .env.example
+   .env
```

## Run application

### __Running in development__

Step 1: In the config's index module, import the development module only.

```js
#file_location: project_folder/config/index.js
```

Step 2: In the config's development module, make required and necessary edits.

```js
#file_location: project_folder/config/development.js
```

Step 3: Startup a local mongodb connection via a GUI, Cloud or terminal then after, copy the connection string, it will be need in further steps.

Step 4: Update the project's config index module with the connection string and other relevant information gotten from the previous step.

```js
#file_location: project_folder/config/development.js
```

Step 4: (Optional) Populate the database via a terminal opened to the project directory:

```bash
npm run devSeedDb
```

Step 5: Start the application:

```bash
npm run devStart
```

### __Running in production__

Step 1: In the config's index module, import the production module only.

```js
#file_location: project_folder/config/index.js
```

Step 2: In the project's dotenv file, make configuration edits for the application.

```js
#file_location: project_folder/.env
```

Step 3: (Optional & Not-recommended) Populate the database, via a terminal opened to the project directory:

```bash
npm run seedDb
```

Step 4: Start the application:

```bash
npm start
```


## API

### Response Body Format

Success response:
```ts
{
  data: {
    code: <number> (http-status-code),
    message: <string>,
    items: [<any>],
    meta: {
      sorts?: {
        field: <string>,
        order: <string>,
      }[],
      filters?: {
        field: <string>,
        operator: <string>,
        value: <any>
      }[],
      pagination?: {
        currentPage: <number>,
        itemsPerPage: <number>,
        itemsSize: <number>,
        totalPages: <number>,
        prevPage: <number>,
        nextPage: <number>,
      }
      payload?: {
        <string>: <number> | <string>
      }
    }
  }
}
```

Error response:
```ts
{
  error: {
    code: <number> (http-status-code),
    message: <string>,
    items: [
      {
        name: <string> (form-field/other)
        value: <any>,
        reason: <string>,
      }
    ]
  }
}
```

### Endpoints

|  Method  | Path                         | Description                             | Request |
| -------- | ---------------------------- | --------------------------------------- | ------- |
| POST     | /auth/session/admins         | Login an admin                          | 
| GET      | /auth/session/admins         | Get a new access token                  |         |
| DELETE   | /auth/session/admins         | Logout an admin                         |         |
| .        |                              |                                         |         |
| GET      | /admins                      | Get all admins                          |         |
| POST     | /admins                      | Create a new admin                      |         |
| GET      | /admins/:id                  | Get a single admin                      |         |
| PATCH    | /admins/:id                  | Update a single admin                   |         |
| DELETE   | /admins/:id                  | Delete a single admin                   |         |
| GET      | /admins/me                   | Get currently logged in admin           |         |
| PATCH    | /admins/me                   | Update currently logged admin           |         |
| DELETE   | /admins/me                   | Delete currently logged in admin        |         |
| .        |                              |                                         |         |
| GET      | /users                       | Get all users                           |         |
| POST     | /users                       | Create a new user                       |         |
| GET      | /users/:id                   | Get a single user                       |         |
| PATCH    | /users/:id                   | Update a single user                    |         |
| DELETE   | /users/:id                   | Delete a single user                    |         |
| .        |                              |                                         |         |
| GET      | /rentals                     | Get all rentals                         |         |
| POST     | /rentals                     | Create a new rental                     |         |
| GET      | /rentals/:id                 | Get a single rental                     |         |
| PATCH    | /rentals/:id                 | Update a single rental                  |         |
| DELETE   | /rentals/:id                 | Delete a single rental                  |         |
| PUT      | /rentals/returns/:id         | Update a single rental return info      |         |
| Get      | /rentals/charges/movies      | Get rental charges of a set of movies   |         |
| .        |                              |                                         |         |
| GET      | /movies                      | Get all movies                          |         |
| POST     | /movies                      | Create a new movie                      |         |
| GET      | /movies/:id                  | Get a single movie                      |         |
| PATCH    | /movies/:id                  | Update a single movie                   |         |
| DELETE   | /movies/:id                  | Delete a single movie                   |         |
| .        |                              |                                         |         |
| GET      | /genres                      | Get all genres                          |         |
| POST     | /genres                      | Create a new genre                      |         |
| GET      | /genres/:id                  | Get a single genre                      |         |
| PATCH    | /genres/:id                  | Update a single genre                   |         |
| DELETE   | /genres/:id                  | Delete a single genre                   |         |
| .        |                              |                                         |         |
| GET      | /roles                       | Get all roles                           |         |
| POST     | /roles                       | Create a new role                       |         |
| GET      | /roles/:id                   | Get a single role                       |         |
| PATCH    | /roles/:id                   | Update a single role                    |         |
| DELETE   | /roles/:id                   | Delete a single role                    |         |
| .        |                              |                                         |         |
| GET      | /memberships                 | Get all memberships                     |         |
| POST     | /memberships                 | Create a new memberships                |         |
| GET      | /memberships/:id             | Get a single membership                 |         |
| PATCH    | /memberships/:id             | Update a single membership              |         |
| DELETE   | /memberships/:id             | Delete a single membership              |         |
