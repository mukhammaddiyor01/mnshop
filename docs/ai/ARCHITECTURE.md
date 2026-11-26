# Architecture

## Current state

- This repository: TypeScript, Express, MongoDB/Mongoose, EJS admin, and API routes.
- Existing web repository: separate React/CRA buyer and seller apps.
- Mobile: planned Expo/React Native buyer application; not created or installed yet.

## Target boundary

```text
Express backend
  ├── API and commerce authority
  └── EJS admin

Web storefronts                 Mobile buyer app
  └── browser-only UI             └── native-only UI
             \                  /
       verified pure contracts only
```

The backend is not moved in this step. A future monorepo decision must preserve the backend/admin runtime and keep web and mobile UI layers separate.

## Client architecture

Feature modules follow adapted MVC:

`View -> controller hook/use case -> typed service -> API client -> backend`

Models are DTOs, normalized entities, pure mappers, and validated form data. Views have no direct HTTP calls. Controller hooks have no platform-specific rendering. Shared code contains no DOM, EJS, MUI, SCSS, React Native components, SecureStore, or browser storage.
