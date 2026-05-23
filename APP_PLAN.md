# Community Map App Plan

## Product Shape

Build a private, local-first relationship map for The Landing. The building map is the navigation layer; the real value is a consented memory layer for people, units, interests, introductions, events, and next relationship moves.

## Data Model

- `Apartment`: floor, unit id, unit label, map geometry, availability metadata.
- `ResidentProfile`: apartment, names, work, interests, relationship stage, notes, last touch, next move.
- `Interaction`: date, person, type, note, follow-up.
- `Gathering`: title, host, apartment/floor, invitees, status.

## Milestones

1. Map foundation: import floor geometry, render floor tabs, support apartment selection.
2. Private profiles: add resident cards, notes, interests, and relationship strength.
3. Relationship memory: log coffee chats, help offered, introductions, and follow-ups.
4. Ownership: encrypted export/import, replaceable map data, and optional cloud sync later.

## Privacy Rules

- Treat resident information as private by default.
- Store only information people have shared willingly.
- Make export/delete easy.
- Keep building-source data separate from personal relationship data.
