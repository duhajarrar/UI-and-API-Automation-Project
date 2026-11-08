# QA Automation Project

Automated tests for an e-commerce website and a REST API, plus a load test of a website's homepage.

Overview found with the following recording: https://www.loom.com/share/92328fb42c574d679339585a3f5768f9

| Part | What it tests | Tools | Folder |
| --- | --- | --- | --- |
| **1. UI automation** | Toolshop e-commerce site: login, search by combined filters, cart, checkout | Playwright, TypeScript | [Part 1 - UI automation testing](Part%201%20-%20UI%20automation%20testing/) |
| **2. API automation** | Traccar API: sending locations to the map (geofences), changing and deleting them | Python, pytest, requests | [Part 2 - API automation testing](Part%202%20-%20API%20automation%20testing/) |
| **3. Load testing** | BlazeDemo homepage: 1000 users in 15 seconds, response time before, during, and after the load. Follow-up: a step test from 10 to 1000 users, and a repeat 1000-user run to check the cause of the slow requests | Apache JMeter | [Part 3 - Load testing](Part%203%20-%20Load%20testing/) |

Each part has its own README with the test report, the bugs found, and how to run it.

**Part 3 in short:** 0 errors at 1000 users; the typical request went from 371 ms to 593 ms, and 41 requests (4%) took 7–10 seconds. A step test showed the median stays flat up to 1000 users and the slowest requests start to grow between 500 and 1000. A repeat run after a 22-minute rest did not bring the same slow requests back, so their cause (possibly server cold starts) is not confirmed. See the [scalability report](Part%203%20-%20Load%20testing/scalability-report.md).

## Bugs found

| Part | Bugs | Where |
| --- | --- | --- |
| UI | 3 (2 High, 1 Medium) | [Part 1 bugs](Part%201%20-%20UI%20automation%20testing/README.md#bugs-found) |
| API | 7 (3 High, 3 Medium, 1 Low) | [Part 2 bugs](Part%202%20-%20API%20automation%20testing/README.md#bugs-found) |

## Continuous integration

The pipeline is defined in [`.gitlab-ci.yml`](.gitlab-ci.yml) with two jobs, **ui-tests** and **api-tests**. Both save their reports as job artifacts, including JUnit results.

**Status:** the project's GitLab has no runner available yet, so the jobs stay pending until one is added.

**Results on a cloud CI runner:** both jobs pass. In ui-tests, all 36 tests pass, and the 3 tests of known bugs fail as expected.

**How ui-tests runs in CI:** the Toolshop site is protected by Cloudflare, which stops headless browsers on cloud servers with a *"Performing security verification"* page. So in CI the browser runs headed inside a virtual display (`xvfb-run`), the same as a normal browser on a laptop. It doesn't use a proxy or hide that the browser is automated.

**Secrets:** the API tests need `TRACCAR_EMAIL` and `TRACCAR_PASSWORD`, set under **Settings → CI/CD → Variables** (masked). The UI tests need no secrets: they create their own user for every run.

**Reports:** after a run, open the job under **Build → Jobs** and download its artifacts: the Playwright report and test results for ui-tests, and the API report for api-tests.