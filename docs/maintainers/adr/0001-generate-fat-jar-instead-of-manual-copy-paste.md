# Automatically generate the `page-accessibility-check` dependency as a fat jar

-   Status: accepted
-   Date: 2022-02-02

Technical Story:
[PLATUI-1547](https://jira.tools.tax.service.gov.uk/browse/PLATUI-1547)

## Context and Problem Statement

Automated Accessibility Assessment in CI is a tool built as part of the
Automated Accessibility Audit in CI.  
In order to achieve a high adoption rate among the tenants certain quick design
choices were made initially. In order to get the tooling out and gather early
feedback, the `accessibility-assessment` tool had been assembled with two
different services.

This has helped with rolling out the tool and a higher adoption rate. However,
this has a cost on maintainability. Bug fixes and adding new features can be
challenging as they require updating different components. These challenges are
not documented which makes it difficult for engineers, unfamiliar with all the
components, to introduce a change.

[hmrc/accessibility-assessment](https://github.com/hmrc/accessibility-assessment)
relies on a fat jar generated from the
[hmrc/page-accessibility-check](https://github.com/hmrc/page-accessibility-check)
but there are drawbacks to the current approach for generating the fat jar.

-   The fat jar needs to be generated manually from the
    `page-accessibility-check` repository locally on a developers machine.
-   Once the fat jar is generated it has to be manually copied and pasted into
    the `accessibility-assessment` repository.
-   Once local testing has completed and the fat jar is validated then the fat
    jar needs to be committed to a branch so that it can be built into an image.

The main impact of the above is that to add/update a filter in the
`page-accessibility-check` repository, which generally should be a quick task,
is taking longer because of this manual step of creating,copying and pasting the
fat jar across different repositories. There are also security risks around
comitting locally compiled artifacts.

With the above in mind, should we:

-   Provide versioning for
    [hmrc/page-accessibility-check](https://github.com/hmrc/page-accessibility-check)?
-   Add the
    [hmrc/page-accessibility-check](https://github.com/hmrc/page-accessibility-check)
    as a dependency of
    [hmrc/accessibility-assessment](https://github.com/hmrc/accessibility-assessment)
    so that the jar would be generated within the `accessibility-assessment`
    repository?

Another direction and one that solves a deeper problem is that the
`page-accessibility-check` and `accessibility-assessment` are using two
different technologies currently, and we could argue that these two libraries
could be written as one scala app to take away complexity of creating
dependencies between them.

-   page-accessibility-check: An app built with Scala
-   accessibility-assessment-service: A node express service exposing endpoints
    to orchestrate page assessment.

This could also give us the opportunity to write the new project in scala which
is a supported language across HMRC. And most developers in HMRC are familiar
with. It could also remove the current pain points when its comes to
adding/updating filters and running Automated tests in our pipeline.

Note, more information around the pain points of having two libraries using
different technologies can be found via the below link
[Challenges with the current Accessibility Assessment setup](https://confluence.tools.tax.service.gov.uk/display/PT/Challenges+with+the+current+Accessibility+Assessment+setup)

## Decision Drivers

-   The speed of adding/updating a filter in `page-accessibility-check` is
    slowed down by the manual creation/manipulation of the generated fat jar.
-   [hmrc/page-accessibility-check](https://github.com/hmrc/page-accessibility-check)
    is not a versioned library which means we cannot revisit older version if we
    wish to, for testing purposes.
-   Copying and pasting is not a reliable way of developing, instead we should
    leverage automation to insure the process is stable with fewer room for
    errors.
-   As the Automated Accessibility Assessment CI needed to be created quickly,
    some design choices were not necessarily ideal and now have proven to be
    less maintainable and potentially confusing to new developers who do not
    have a background understanding of the tool.
-   We want a tactical solution that doesn't need to consider too much the
    future, because any new iteration of the service will likely be a rewrite
    which changes the architecture.

## Considered Options

-   Option 1: do nothing
-   Option 2: make `page-accessibility-check` a dependency of
    `accessibility-assessment` and introduce the sbt assembly plugin so that the
    fat jar can be generated in the correct location within the
    `accessibility-assessment` repository.
-   Option 3: as option 2 but version the `page-accessibility-check` library.
-   Option 4: as option 3 but do not run the sbt assembly command locally but
    instead rely on jenkins to do so and bake it directly into the image that
    the jenkins job builds.
-   Option 5: rewrite the Automated Accessibility Assessment tool in scala and
    remove the need for multiple dependencies that require both scala and node
    knowledge.
-   Option 6: move the `page-accessibility-check` into the
    `accessibility-assessment` project as a subproject

## Decision Outcome

Chosen Option 6: move the `page-accessibility-check` into the
`accessibility-assessment` project as a subproject

### Positive Consequences

-   We can remove manual steps needed to build the project, improving security
    and reducing places where mistakes can be made.
-   Adding/Updating filters will be a quicker.
-   Minimal changes needed, so easy to change again in the future.

### Negative Consequences

-   Depending on how we merge the repos, we might lose some commit history for
    page-accessibility-check.

## Pros and Cons of the Options

### Option 1

-   Good, because no further work required.
-   Bad, because it doesn't solve the problem.

### Option 2

-   Good, because it's simple.
-   Good, because it allows the fat jar to be generated and placed in the
    correct folder within `accessibility-assessment` with one command.
-   Bad, because this will only be able to be run locally and will not tie into
    our automation pipeline.

### Option 3

-   Good, because it gives us the ability to test previous versions of the
    filters which currently cannot be done.
-   Bad, because this will only be able to be run locally and will not tie into
    our pipeline.

### Option 4

-   Good, because we do not need to run any commands locally and the fat jar
    will be built and run in our jenkins pipeline.
-   Good, because we do not need to worry about the fat jar at all, the image
    built from jenkins will do it all in the background.
-   Bad, because it may make testing locally a bit more cumbersome.

### Option 5

-   Good, removes the complexity of having two projects that are dependent on
    one another for the CI pipeline.
-   Good, removes the complexity of having two dependant tools that are written
    in different languages.
-   Good, as we will write the new tool in scala which is a widely supported
    language within HMRC this will make future adoption and maintainability
    easier.
-   Good, because we get to surface potential pitfalls in the current
    implementation and make it better and more efficient to use.
-   Bad, as we will need to spike this work to understand how we can consolidate
    the services into one scala application, which means it could take more time
    and effort.

### Option 6

-   Good, removes the complexity of having two projects that are dependent on
    one another for the CI pipeline.
-   Good, no need to rewrite code but rather use existing code.
-   Good, as generating the fat jar can be done in the
    `accessibility-assessment` project, and the building of the fat jar can be
    automated.
-   Bad, as we will still be maintaining two different languages.
