<!-- stripe-projects-cli managed:agents-md:start -->
## Stripe Projects CLI

This repository is initialized for the Stripe project ".".

## Tools used

- [Stripe CLI](https://docs.stripe.com/stripe-cli) with the `projects` plugin to manage third-party services, credentials, and deployments for this project. Use the stripe-projects-cli to manage deploying and access to third party services.
<!-- stripe-projects-cli managed:agents-md:end -->

## Shared design language

Read `DESIGN.md` before changing UI or marketing. `docs/design-audit.md` is historical evidence,
not implementation guidance. Edit shared sources in `dnnsmnstrr/chordlist`; consumers vendor a
reviewed bundle with `python3 design/sync.py /absolute/path/to/chordlist`. Run
`python3 design/build.py --check` alongside the normal repository checks. Never hand-edit generated assets.
