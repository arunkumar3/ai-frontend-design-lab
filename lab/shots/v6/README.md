# v6 captures — read this before judging them

These six images were captured by `pnpm shoot v6` in an environment whose network
policy blocks `image.tmdb.org`. **Every poster request 403s, so every card falls back
to the designed no-artwork panel.** That path is real and worth seeing — six of the
thirteen IN titles have no artwork in the data — but a slate rendered entirely as
fallback panels is not what the page looks like with art.

Re-run `pnpm shoot v6` anywhere `image.tmdb.org` is reachable and commit the result
over these.

The pre-redesign captures (with real poster art) are in git history at commit
`330ead5`, under this same path.

The design pass reviewed the poster grid by intercepting the TMDB requests and
serving flat two-tone stand-ins in the colours the palette derivation actually
measured in the real slate. Those captures were a working aid and are not committed;
`playbook/findings/v6-frontend-design-skill.md` §6 records the method and what it can
and cannot show.
