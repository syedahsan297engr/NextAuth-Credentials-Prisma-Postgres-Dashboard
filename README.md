## Next.js App Router Dashboard, NextAuth, Prisma, Postgre

- Make sure you have env setup.
- A database connected, specify the connection url in env
- Run `pnpm install` to install all packages.
- After this run command `npm run migrate` -> this will sync your db with schema
- Then run `npx prisma db seed` this will populate user table with name, password and email.
- Start the app using `npm run dev`.
- Login the dashboard based on your credentials.
- Currently you will not see any thing visualizing as there is no data in the tables. (You may get errors as well).
- Write seeders for those tables as well, populate them with dummy data.
- Repo is open for modifications, you can add seeders. After that you will see the dashboard working.
