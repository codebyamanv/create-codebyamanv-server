Instead of installing with `npm i`, run the CLI directly:

```bash
npm create codebyamanv-server@latest
```

I have created basic apis for when server starts and for User to understanding the how middlewares and utilities working

## Packages used

```js
dependencies:{
    "bcrypt": "^6.0.0",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-rate-limit": "^8.5.2",
    "geoip-lite": "^2.0.2",
    "helmet": "^8.2.0",
    "module-alias": "^2.3.4",
    "mongoose": "^8.24.0",
    "morgan": "^1.11.0",
    "multer": "^2.1.1",
    "ua-parser-js": "^2.0.10",
    "zod": "^4.4.3"
}

devDependencies:{
    "@ianvs/prettier-plugin-sort-imports": "^4.7.1",
    "@types/express": "^5.0.6",
    "@types/node": "^25.9.1",
    "nodemon": "^3.1.11",
    "prettier": "^3.8.3"
}


```

## 🔧 Update Env

Make sure to update your **.env** file with your MongoDB connection URL and other required variables.
If you don’t update the environment variables, the server will throw errors while running.

---

## 🌐 Domain

Check the following files:

-   `src/utils/sessionUtils.js`

In these files, cookies are set/cleared with configuration like:

```js
{
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    // domain: 'Enter your domain here',
    maxAge: 7 * 24 * 60 * 60 * 1000,
}
```

if your backend is on subdomain most likely it will be than use .before domain
ex: .domain

## 📩 Contact

For any queries, suggestions, or contributions, feel free to reach out:

-   Name: Aman Verma
-   Email: amanverma0428@gmail.com
-   GitHub: https://github.com/codebyamanv
