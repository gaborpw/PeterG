# Contributing

## Branches

Cut from `main`. Never commit to `main` directly — it is protected.

```
feat/playthrough-model
fix/igdb-sync-retry
docs/adr-rating-scale
chore/bump-go
```

## Commits

[Conventional Commits](https://www.conventionalcommits.org/). CI rejects anything else.

```
feat(api): add playthrough status transitions
fix(app): keep hours input focused after increment
docs: record the rating-scale decision as ADR 0003
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`,
`chore`, `revert`. Scope is optional and is usually `api`, `app`, `web` or `docs`.

Breaking changes get a `!` before the colon and a `BREAKING CHANGE:` footer.

## Merge requests

1. Push your branch and open an MR against `main`.
2. Fill in the template — it is short on purpose.
3. CI must be green. A red pipeline is not a review problem, it is yours.
4. Squash on merge. The branch name and MR title become the history, so write
   them like someone will read them in a year.

## Architecture decisions

Anything that would be annoying to reverse gets an ADR in `docs/adr/`, numbered
sequentially, in the same format as `0001`. Write it *before* the implementation
MR, or as its first commit. An ADR is a paragraph of context, the decision, and
the consequences you accept — not a design doc.

## Local checks

```sh
make check
```

Run it before pushing. It runs exactly what CI runs.
