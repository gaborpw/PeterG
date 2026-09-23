# 1. Record architecture decisions

- **Status:** accepted
- **Date:** 2026-09-23

## Context

Checkpoint is being designed before it is built, and the reasoning behind the
early decisions is the valuable part. Six months from now the question will not be
*what* the schema looks like — that is readable from the code — but *why* rating
lives on the playthrough, and what breaks if you move it.

## Decision

Every decision that would be annoying to reverse gets a numbered file here, in
this format: context, decision, consequences. Written before or alongside the
implementation, never after.

An ADR is short. If it needs more than a page, the design is not settled enough
to write down yet.

## Consequences

- A new contributor can read `docs/adr/` in ten minutes and know which arguments
  have already been had.
- Superseded decisions are not deleted. They get `Status: superseded by ADR-000N`,
  because the wrong turns are often the most useful part of the record.
