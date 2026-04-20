"use client";
/**
 * KEYCLOAK AUTHENTICATION - DEEP DIVE TUTORIAL
 * 
 * --- KEYCLOAK ADMIN CONSOLE SETUP ---
 * To make this code work, you must create a Client in your Keycloak Admin Console:
 * 1. Log in to Keycloak (https://auth.threemonkeys.in).
 * 2. Select your Realm (e.g., 'vhc-todo-26').
 * 3. Go to "Clients" in the left sidebar and click "Create client".
 * 4. General Settings:
 *    - Client ID: 'myclient' (Must match Line 63 in this file).
 *    - Client Protocol: 'openid-connect'.
 * 5. Capability Config:
 *    - Client Authentication: 'OFF' (IMPORTANT: This is a Public client).
 *    - Authorization: 'OFF'.
 *    - Authentication flow: Check 'Standard flow'.
 * 6. Login Settings:
 *    - Valid redirect URIs: 'http://localhost:3000/*'
 *    - Web Origins: '+' (This allows your app to talk to Keycloak from localhost).
 * 7. Click "Save".
 * 
 * --- CONCEPT: WHAT IS "AUTH CONTEXT"? ---
 * In a real application, you don't want to initialize Keycloak on every single page.
 * "Auth Context" is a React pattern (using Context API) that initializes Keycloak ONCE
 * at the very top of your app (usually in layout.js) and "shares" the logged-in user 
 * state with every other page. This file shows a simple version of what happens 
 * "inside" that context.
 */

// 1. IMPORTING THE TOOLS
import { useEffect, useState } from "react";
import Keycloak from "keycloak-js";

export default function KeycloakAuthPage() {
  /**
   * 2. SETTING UP THE "BRAIN" (STATE)
   * - instance: The Keycloak object.
   * - authenticated: True if the user is logged in.
   * - user: User profile data (Name, Email).
   */
  const [instance, setInstance] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  /**
   * 3. THE HANDSHAKE (INITIALIZATION)
   */
  useEffect(() => {
    const startKeycloak = async () => {
      const keycloak = new Keycloak({
        url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
        realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
        clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
      });

      try {
        // [FETCHING TOKENS START]
        // This 'init' method is where the magic happens. Keycloak checks the browser 
        // URL and Cookies to see if tokens exist or if we just returned from a redirect.
        const isAuthed = await keycloak.init({ onLoad: "check-sso" });
        // [FETCHING TOKENS END]

        setInstance(keycloak);
        setAuthenticated(isAuthed);

        if (isAuthed) {
          /**
           * Step C: Get User Details.
           * loadUserProfile() uses the 'ID Token' to get name/email.
           */
          const profile = await keycloak.loadUserProfile();
          setUser(profile);

          /**
           * --- TOKEN EXPLANATION ---
           * Once authenticated, the 'keycloak' object has 3 important tokens:
           * 1. keycloak.token (Access Token): A string used to tell APIs "I have permission".
           * 2. keycloak.idToken: Contains identity info like name and email.
           * 3. keycloak.refreshToken: Used to get a NEW access token when the old one expires.
           * 
           * WHERE ARE THEY SAVED? 
           * By default, they are saved in local memory inside variables. If you refresh 
           * the page, the 'init' method will automatically try to find them again 
           * using session cookies.
           */
          console.log("Access Token (Fetched & Saved):", keycloak.token);
        }
      } catch (error) {
        console.error("Initialization Failed:", error);
      }
    };

    startKeycloak();
  }, []);

  const login = () => { if (instance) instance.login(); };
  const logout = () => { if (instance) instance.logout(); };

  /**
   * --- HOW TO USE THE TOKEN ---
   * In a real app, you would send the token to your backend like this:
   * 
   * const response = await fetch('/api/data', {
   *   headers: {
   *     'Authorization': `Bearer ${instance.token}` // [USING THE TOKEN]
   *   }
   * });
   */

  return (
    <div className="min-h-screen bg-gray-50 p-12 flex flex-col items-center">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 italic">Auth Lab</h1>
        <div className="h-1 w-20 bg-blue-500 mx-auto mb-8 rounded-full"></div>

        {/* [UI SWITCH STARTS HERE] */}
        {/* We use the 'authenticated' state to decide which UI version to show */}
        {!authenticated ? (
          /* --- VERSION A: USER IS NOT LOGGED IN --- */
          <div>
            <div className="mb-8 p-4 bg-red-50 rounded-xl">
              <p className="text-red-600 font-medium italic underline">Wait! You are NOT signed in yet.</p>
            </div>
            <button
              onClick={login}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              Secure Sign In
            </button>
          </div>
        ) : (
          /* --- VERSION B: USER IS LOGGED IN --- */
          <div>
            <div className="mb-4 p-4 bg-green-50 rounded-xl">
              <p className="text-green-600 font-medium text-sm">Authentication Successful ✅</p>
            </div>

            {user && (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left mb-6 space-y-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">User Identity</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Username:</span>
                  <span className="font-mono">{user.username}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-semibold">{user.email}</span>
                </div>
              </div>
            )}

            {/* TOKEN VISUALIZATION */}
            <div className="bg-blue-50 p-4 rounded-xl mb-8 text-left border border-blue-100">
              <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mb-2">Technical Token Context</p>
              <p className="text-[10px] text-blue-700 leading-tight break-all font-mono">
                <strong>Access Token:</strong> {instance?.token?.substring(0, 50)}...
              </p>
              <p className="text-[9px] text-blue-500 mt-2 italic">
                (Tokens are fetched during init and saved in the component state/memory)
              </p>
            </div>

            <button
              onClick={logout}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-all active:scale-95"
            >
              End Session (Logout)
            </button>
          </div>
        )}
        {/* [UI SWITCH ENDS HERE] */}

        <div className="mt-12 text-left border-t border-gray-100 pt-8">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Auth Concepts for Trainees:</h3>
          <ul className="text-xs text-gray-500 space-y-3 list-disc list-inside">
            <li><strong>Access Token:</strong> The "Passport" used to talk to databases/APIs.</li>
            <li><strong>ID Token:</strong> The "ID Card" that shows who the user is.</li>
            <li><strong>Refresh Token:</strong> The "Renewal Form" used to get new passports.</li>
            <li><strong>Context:</strong> A wrapper that shares this "instance" with ALL pages.</li>
          </ul>
        </div>
      </div>

      {/**
       * --- LEARNER ASSIGNMENT (DO IT YOURSELF!) ---
       * Now that you've seen how basic auth works, try these 3 challenges:
       * 
       * 1. THE NAME CHALLENGE: 
       *    Modify the "Welcome back" message to include the user's first name.
       *    (Hint: Look at the 'user' object and the 'firstName' property).
       * 
       * 2. THE TOKEN BUTTON:
       *    Add a new button called "Debug Token". When clicked, it should show 
       *    an alert() containing the full `instance.token`.
       * 
       * 3. THE ENV VAR CHALLENGE (BEST PRACTICE):
       *    Move your Keycloak credentials to `.env.local` and use `process.env`.
       *    (This is already done in the code above, study how it works!)
       * 
       * 4. THE PROTECTED HOME PAGE:
       *    Go to `src/app/page.js` and try to hide the Todo list unless the 
       *    user is authenticated. How would you share the `instance` there?
       */}
    </div>
  );
}
