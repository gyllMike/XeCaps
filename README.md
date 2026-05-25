# XeCaps - Space Mission Control Backend

This is a **TypeScript/Express** backend for managing space mission planning, including:
- user authentication
- mission management
- astronaut allocation
- launch vehicle management
- launch state transitions
- payload deployment
- LLM-powered astronaut chat

---

## Features

- User authentication and session management
- Mission CRUD operations with ownership validation
- Astronaut pool management and mission assignment
- Launch vehicle creation, update, retirement, and launch allocation
- Launch lifecycle simulation using state transitions
- Payload deployment tracking
- LLM-backed astronaut chat using OpenRouter API
- REST API documentation via Swagger
- HTTP-level tests with Jest

---

## Tech Stack

- TypeScript
- Node.js / Express
- Jest / ts-jest
- Swagger UI
- JSON-file persistence
- OpenRouter API

---

## Architecture

The backend is organised by feature area, with `server.ts` acting as the HTTP routing layer and the remaining modules containing domain-specific business logic.

```txt
src/
├── server.ts          # Express routes and HTTP layer
├── auth.ts            # Authentication and session logic
├── mission.ts         # Mission management
├── astronaut.ts       # Astronaut management and LLM chat
├── launch.ts          # Launch lifecycle and payload logic
├── launchVehicle.ts   # Launch vehicle management
├── dataStore.ts       # JSON-backed data persistence
└── helpers.ts         # Shared validation and utility functions
```

---

## Getting Started

Follow the steps below to run the backend server locally.

### 1. Install dependecies

Install all required Node.js dependencies:

```bash
npm install
```

### 2. Configure environment variables

Create a local environment file from the example template:

```bash
cp .env.example .env.local
```

Or on Windows PowerShell, use:

```Power Shell
Copy-Item .env.example .env.local
```

Then open `.env.local` and add your own OpenRouter API key if you want to use the LLM-powered astronaut chat feature:

```env
OPENROUTER_API_KEY=<replace_with_your_openrouter_api_key_here>
```

### 3. Start the development server

Run the backend server in development mode:

```bash
npm run start-dev
```

This terminal should stay open while the server is running.

### 4. Open the API documentation

After the server starts, open the Swagger documentation in your browser:

```
http://127.0.0.1:3200/docs
```

To run tests or send requests while the server is running, open a second terminal in the same project directory.

---

## Testing

This project includes static checks, TypeScript compilation checks, and Jest-based automated tests.

### Run linting

Check code style and optential linting issues:

```bash
npm run lint
```

### Run TypeScript compilation check

Verify that the TypeScript code compiles successfully:

```bash
npm run tsc
```

### Run automated tests

Run the Jest test suite:

```bash
npm test
```

### Recommended verification workflow

Before committing changes, run the following commands in order:

```bash
npm run lint
npm run tsc
npm test
```

---

## My Contributions

- Implemented **core admin-side** backend features, including `adminAuthRegister`, `adminMissionInfo`, `adminAstronautAssign`, and `adminAstronautUnassign`.
- Built the corresponding **API/interface layer** for these features, ensuring that backend logic could be accessed through the project’s request/response structure.
- Wrote **tests** for the implemented admin authentication, mission information, astronaut assignment, and astronaut unassignment behaviours.
- Implemented `launchVehicleList`, supporting retrieval of launch vehicle information within the project’s launch management workflow.
- Designed most of the project’s **core data types and data structures**, covering admins, missions, astronauts, launches, launch vehicles, and related system state.

---

## Course Context and Attribution

XeCaps was originally developed as a group backend project for UNSW College DPST1093.

This public version has been cleaned and reorganised for portfolio and learning purposes after the course was completed. Course-provided starter or adaptation code is either removed, clearly separated, or not listed as part of my personal contributions.

The contribution details below are included to transparently distinguish individual work from collaborative group work and course-provided scaffolding.

### Original Team

| Member | Main Contributions |
| ------ | ------------------ |
| Yulin Guo / Alan | Admin ControlUser Details, Admin MissionName Update, Admin MissionDescription Update, LaunchVehicle Information, LaunchVehicle Update, Update Launch State, Astronaut Detail Update, corresponding API interface layer, tests, helper functions. |
| Xiangting Li / Chris | Admin registration, mission information, astronaut assignment/unassignment, launchVehicle list, corresponding API interface layer, tests, core data structure design |
| Yuchen Wang / Eric | Developed authentication and mission management features, including user login, user logout, mission list retrieval, and mission deletion. Also implemented astronaut pool retrieval functionality. |
| You Wu / William | Developed account management features, including updating user details and user passwords. Also contributed to astronaut detail retrieval by ID. |
| Zhen Cao / Zhen | Developed core mission management features, including creating missions, clearing system data, and updating mission targets. Also contributed to astronaut creation functionality. |