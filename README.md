# Volunteam App

## Setting up the fake API (json-server)

The app finds json-server on the same computer as the Expo dev server (see `src/services/api.ts`), so there is no IP address to edit. Start the fake API so other devices on your network can reach it:

```
npx json-server --watch db.json --port 3333 --host 0.0.0.0 -m ./node_modules/json-server-auth
```

Then start the app with `npx expo start` and open it in Expo Go. Every seed user's password is `123456`.

To access your server online without running json-server locally, you can set your baseURL to:

```
https://my-json-server.typicode.com/<your-github-username>/<your-github-repo>
```

To use `my-json-server`, make sure your `db.json` is located at the repo root.

## Setting up the image upload API

Update the file `src/services/imageApi.ts`.

You can use any hosting service of your preference. In this case, we will use ImgBB API: https://api.imgbb.com/.
Sign up for free at https://imgbb.com/signup, get your API key and add it to the .env file in your root folder.

To run the app in your local environment, you will need to set the IMGBB_API_KEY when starting the app using:

```
IMGBB_API_KEY="insert_your_api_key_here" npx expo start
```

When creating your app build or publishing, import your secret values to EAS running:

```
eas secret:push
```
