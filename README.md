# SQA Demo App

This lightweight React 19 + Vite + TypeScript application was built **specifically as an assignment for Software QA / Automation Engineer candidates**.

It contains two feature-rich but compact pages that exercise routing, asynchronous data loading, UI state, theming, and user interaction – the perfect playground for writing end-to-end tests with Cypress, Playwright, etc.

## Tech stack

-   React **19** + React DOM 19
-   TypeScript 5
-   Vite 6
-   React Router 6
-   Tailwind CSS + shadcn/ui
-   Playwright (for testing)

## Functional overview

| Path     | Feature highlights                                                                                                                                                                                                               | External API                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `/`      | _Responsive_ masonry-like **image gallery**.<br/>Images are fetched from the public [Picsum Photos](https://picsum.photos) REST API.<br/>Each tile lazy-loads, shows an author caption and a skeleton placeholder while loading. | `https://picsum.photos/v2/list`                   |
| `/jokes` | **Dad jokes list** from the official joke API.<br/>Each card lets the user reveal the punch-line and "like" a joke (local state).                                                                                                | `https://official-joke-api.appspot.com/jokes/ten` |

Global extras:

-   Persistent **light / dark theme** (CSS variables, toggled & remembered via `localStorage`).
-   Responsive **navigation bar** with active-link styling.
-   404 fallback screen.
-   Comprehensive error handling with visual error banners.

## Running the app locally

Make sure a latest stable version of Node.js is installed.

```bash
npm i   # or yarn
npm dev # starts Vite dev-server on http://localhost:8080 (configured in vite.config.ts)
```

## Running the tests

The project includes a comprehensive Playwright test suite covering all the scenarios listed below.

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npx playwright test

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests with UI mode (interactive)
npx playwright test --ui

# Run specific test file
npx playwright test tests/navigation.spec.ts

# Generate test report
npx playwright show-report
```

## Test Coverage

The test suite includes **12 comprehensive test scenarios** across 10 test files:

### 📁 tests/navigation.spec.ts
1. **Navigation** – Verify that the _Gallery_ and _Jokes_ links switch pages and the URL matches.
2. **Active link styling** – Ensure correct visual indication of current page.

### 📁 tests/gallery-api.spec.ts  
3. **API stubbing** – Intercept the Picsum API and assert that exactly 12 images render.
4. **Error handling** – Stub a 500 response and assert the error banner is displayed.
5. **Loading states** – Verify skeleton placeholders during data fetching.

### 📁 tests/image-loading.spec.ts
6. **Lazy-load placeholder** – Ensure the grey placeholder disappears after the image `load` event.
7. **Image accessibility** – Each `<img>` must include a non-empty `alt` attribute.
8. **Lazy loading behavior** – Verify `loading="lazy"` attributes.

### 📁 tests/jokes-api.spec.ts
9. **Joke fetch** – Stub the jokes endpoint and check that jokes are listed.
10. **API error handling** – Test error scenarios for jokes API.

### 📁 tests/joke-interactions.spec.ts
11. **Punch-line reveal** – Clicking _Show Punchline_ toggles visibility & button text.
12. **Like counter** – Every click increments the 👍 counter, state is isolated per joke card.

### 📁 tests/theme-persistence.spec.ts
13. **Theme persistence** – Toggle dark mode, reload the page, theme choice should persist.
14. **Cross-page theme** – Theme maintains across navigation.

### 📁 tests/404-page.spec.ts
15. **404 page** – Visit an unknown route and validate _404 – Page Not Found_ shows.
16. **Console logging** – Verify 404 errors are logged to console.

### 📁 tests/responsive.spec.ts
17. **Mobile responsiveness** – Test layout and functionality on mobile viewports.
18. **Masonry adaptation** – Gallery layout adapts to different screen sizes.

### 📁 tests/network-performance.spec.ts
19. **Network throttling** – Test app behavior under slow network conditions.
20. **Performance optimization** – Verify lazy loading and image optimization.

### 📁 tests/accessibility.spec.ts
21. **Accessibility audits** – Uses Playwright's `axe` integration for automated a11y testing.
22. **Keyboard navigation** – Verify full keyboard accessibility.
23. **Screen reader support** – Test ARIA labels and semantic markup.

## Advanced testing scenarios

Depending on your chosen tool you might also explore:

-   **Visual regression testing** of light vs. dark themes.
-   **Network interception** for API stubbing and error simulation.
-   **Performance monitoring** with Lighthouse integration.
-   **Cross-browser testing** across Chrome, Firefox, Safari.
-   **Mobile device testing** with real device emulation.

## Test Architecture

The test suite follows best practices:

- **API Mocking**: All external API calls are intercepted and mocked for reliable testing
- **Error Simulation**: Tests include error scenarios (500 responses, timeouts, rate limiting)
- **State Testing**: Comprehensive testing of UI state changes and persistence
- **Accessibility**: Automated a11y testing with axe-core
- **Responsive Design**: Tests across multiple viewport sizes
- **Performance**: Network throttling and lazy loading verification

Good luck & have fun! 🎉

## Development

To add new test scenarios:

1. Create a new `.spec.ts` file in the `tests/` directory
2. Follow the existing patterns for API mocking and assertions
3. Run `npx playwright test --headed` to debug new tests
4. Use `npx playwright codegen localhost:8080` to generate test code interactively