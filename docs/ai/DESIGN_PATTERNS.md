# Design patterns

- Backend: router -> controller -> service -> Mongoose schema. Middleware is used for authentication, authorization, uploads, maintenance, session, and CSRF concerns.
- Clients: feature-oriented adapted MVC. Query/mutation hooks orchestrate use cases; views render states; services adapt verified API contracts.
- State: server cache belongs in the query layer; transient form, modal, and navigation state stays local. Do not mirror all server data in global state.
- Errors: typed services normalize expected API errors; views provide loading, empty, error, and success states.
- Mapping: DTO-to-view-model conversion occurs at the service/model boundary, not inside visual components.
- Dependency rule: platform-specific code may depend on pure contracts; pure contracts may not depend on a platform.
