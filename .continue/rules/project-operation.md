\# QuickerFix Autonomous Development Rule



The file `QuickerFix\_Implementation\_Guide.md` is the authoritative specification for this project.



Before making any changes:



1\. Read the implementation guide and understand the relevant phase.

2\. Inspect the existing project files before creating or modifying anything.

3\. Compare the current implementation against the implementation guide.

4\. Determine what is already complete, incomplete, incorrect, or missing.

5\. Do NOT rebuild existing working functionality unnecessarily.

6\. Implement the missing or incorrect functionality according to the guide.

7\. Follow the phases and architecture defined in the guide.

8\. Preserve existing working functionality unless a change is required by the guide.

9\. Do not modify unrelated files.

10\. After every meaningful change, compile/build and test the affected functionality.

11\. If a build or test fails, diagnose the failure, fix it, and test again.

12\. Continue through the required implementation steps without stopping unnecessarily.

13\. Before declaring a phase complete, verify that its requirements from the guide are actually implemented.

14\. Never claim something is implemented without checking the actual project files and build/test results.

15\. If an external service, API key, credential, or unavailable dependency is required, do not invent credentials or fake successful integration. Clearly identify the dependency and continue with other work that can be completed safely.

16\. For Aadhaar/identity verification, follow the implementation guide but do not claim real UIDAI verification unless a legitimate authorized integration is actually configured.

17\. Keep the implementation consistent across backend, database, API, and frontend.

18\. When modifying an existing feature, inspect all related controllers, services, repositories, entities, DTOs, and frontend components before making the change.

19\. Prefer the simplest implementation that satisfies the specification.

20\. At the end of each completed phase, provide a concise summary of:

&#x20;  - files changed

&#x20;  - functionality implemented

&#x20;  - tests/build commands executed

&#x20;  - remaining issues



IMPORTANT:

`QuickerFix\_Implementation\_Guide.md` is the source of truth.

The existing project is the starting point.

Do not blindly generate a new project.

Inspect first, implement second, verify third.

