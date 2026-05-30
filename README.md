# ADU Budget Builder

A local prototype for building and managing fixed-price ADU budgets.

Phone edit test.

The current starter budget is based on the Eastern Mass / 7 Jennifer ADU planning workflow.

## What it does now

- Tracks contract value, estimated cost, projected profit, margin, and 25% target gap.
- Organizes the budget in construction sequence.
- Keeps labor and material costs separate.
- Lets columns be shown or hidden.
- Supports expandable detail rows with nested line items.
- Rolls child detail costs into parent budget lines.
- Saves edits in this browser with local storage.
- Can copy the whole budget or save it as a browser-local template.

## Open locally

You can open `index.html` directly in a browser.

To test it from another device on the same Wi-Fi, run:

```bash
node server.js
```

Then open the address shown in the terminal.

## Natural next steps

- Improve the mobile layout.
- Add project templates and saved projects.
- Add import screens for PDFs, quotes, and spreadsheets.
- Add a reusable supplier/sub directory.
- Add material estimate templates.
- Add quote version history.
- Add actuals/job accounting once the budget workflow feels right.

## Cloud sync setup

The app can be moved from browser-only storage to Supabase-backed project storage.

1. Create a Supabase project.
2. Run `supabase-schema.sql` in the Supabase SQL editor.
3. `cloud-config.js` contains the Supabase project URL and public publishable key for this app.
4. Keep Row Level Security enabled. Do not use the service-role key in the browser.
