# Working on Checkpoint

This is a solo project. The conventions below exist to help future-you, not to
satisfy a reviewer. Keep the ones that earn their place; drop any that turn into
ceremony.

## Branching

Push straight to `main` for ordinary work. You are the only person who can break
it, and CI tells you within a minute if you did.

Cut a branch when a change is big enough that you might want to abandon it
halfway:

```sh
git checkout -b feat/steam-import
```

Merge it yourself when it works. No merge request needed — though GitLab will
happily give you one if you want the diff view.

## Commits

Conventional Commits, because it costs nothing and makes `git log` readable in
six months when you have forgotten all of this:

```
feat(app): add the log-a-session sheet
fix(api): retry IGDB sync on 429
docs: record the rating-scale decision as ADR 0004
```

Types: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
Scope is usually `api`, `app`, `web` or `docs`.

CI checks this format on merge requests only, so it never blocks a direct push.
It is a habit, not a gate.

## Architecture decisions

**This is the convention worth keeping.** Anything you would struggle to explain
to yourself next year goes in `docs/adr/` — a paragraph of context, the
decision, and what it costs. Solo projects lose reasoning faster than team ones,
because nobody ever had to argue for it out loud.

See `docs/adr/0001` for the shape.

## Before you push

```sh
make check
```

Runs exactly what CI runs: gofmt, go vet, go test, and the app's typecheck.

## If someone else ever joins

Turn on protected branches and required merge requests then, not now. The
templates in `.gitlab/` are already there for that day.
