# OTT release radar

A weekly OTT release radar over 22 hand-scraped titles in two regions, built eight times
(`/v0`–`/v7`) to measure what each design lever is actually worth. The measurement is
finished and written up; the current work is making the feed real.

**Start with [`HANDOFF.md`](HANDOFF.md).** It is the current state, every verification
command, what is blocked, and what is open.

```bash
cd lab && pnpm install && pnpm dev     # http://localhost:5173/, routes /v0 … /v7
```

## What is here

| | |
|---|---|
| [`lab/`](lab/) | the app and its check scripts |
| [`HANDOFF.md`](HANDOFF.md) | current state — read first |
| [`PHASE-2.md`](PHASE-2.md) | why each `v6` decision was made, and the trap list |
| [`findings/`](findings/) | one write-up per build, plus [`RANKING.md`](findings/RANKING.md), the repo's central argument |
| [`docs/`](docs/) | the original plan and the dated session records |

## What is not here

The **design constitution** ([`../../CLAUDE.md`](../../CLAUDE.md)) and the **playbook**
([`../../playbook/`](../../playbook/)) live at the repository root, because they are not
about this product. They govern every frontend project in the repo. The build gate in
[`../../playbook/FINGERPRINTS.md`](../../playbook/FINGERPRINTS.md) is the same.

## Path convention

Paths written in these documents are relative to **this folder**, not the repository root:
`lab/src/routes/v7/` means `projects/ott-radar/lab/src/routes/v7/`. Documents under
`docs/` are dated records whose text predates the move and is deliberately unchanged; each
carries a banner saying so.
