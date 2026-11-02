# Test Script: Login Screen

**Feature:** Log in with email and password (Login screen)
**Bug report:** Some registered volunteers cannot log in. The app shows "invalid email" under the Email label for addresses that are valid, and the Log in button is active on an empty form, although the design shows it greyed out until the form is filled in.

## Business requirements

| ID | Requirement |
|---|---|
| R1 | Any registered volunteer can log in with their email and password, whatever their email domain ends in (`.it`, `.com.br`, `.ca`, `.info`, ...). |
| R2 | An email that is not a valid address is flagged with "invalid email" and the request is not sent. |
| R3 | A password shorter than 6 characters is flagged with "invalid password". |
| R4 | The Log in button is greyed out and does nothing until both Email and Password have been filled in (Task Requirements diagram). |
| R5 | After a successful login the volunteer lands on the events map. |

## Test environment

- Expo SDK 57 app running in Expo Go on a phone, on the same Wi-Fi network as the computer.
- Fake API: `npx json-server --watch db.json --port 3333 --host 0.0.0.0 -m ./node_modules/json-server-auth`
- App: `npx expo start`, then scan the QR code with Expo Go.
- Seed users (password `123456` for all): `luigi@carluccio.it`, `john@silva.com.br`, `eva.young@example.com`.
- Unit tests: `npm test`

## Manual test cases

| # | Req | Steps | Expected result |
|---|---|---|---|
| TC1 | R4 | Open the app on the Login screen without typing anything. | Log in button is greyed out. Tapping it does nothing. |
| TC2 | R4 | Type an email only, leave Password empty. | Log in button stays greyed out. |
| TC3 | R1, R5 | Email `luigi@carluccio.it`, Password `123456`, tap Log in. | No "invalid email". The events map opens. |
| TC4 | R1, R5 | Email `john@silva.com.br`, Password `123456`, tap Log in. | No "invalid email". The events map opens. |
| TC5 | R1, R5 | Email `eva.young@example.com`, Password `123456`, tap Log in. | The events map opens (regression check for a 3-letter domain). |
| TC6 | R1 | Email `  Luigi@Carluccio.IT ` (capitals, spaces around it), Password `123456`, tap Log in. | Accepted: the email is trimmed and lower-cased, and the events map opens. |
| TC7 | R2 | Email `luigi@carluccio`, Password `123456`, tap Log in. | "invalid email" is shown and no request is sent. |
| TC8 | R2 | Email `luigi.carluccio.it` (no @), tap outside the field. | "invalid email" is shown. |
| TC9 | R3 | Email `luigi@carluccio.it`, Password `123`, tap Log in. | "invalid password" is shown and no request is sent. |
| TC10 | R1 | Email `luigi@carluccio.it`, Password `wrongpass`, tap Log in. | The email passes validation and the server's "Incorrect password" error is shown in an alert. |

## Results before the fix (reproducing the bug)

| # | Actual result | Status |
|---|---|---|
| TC1 | Log in button is orange and active on the empty form. Tapping it shows both "invalid" labels. | FAIL |
| TC2 | Log in button is active. | FAIL |
| TC3 | "invalid email" shown under Email; the request is never sent. | FAIL |
| TC4 | "invalid email" shown under Email; the request is never sent. | FAIL |
| TC5 | Events map opens. | PASS |
| TC6 | "invalid email" shown. | FAIL |
| TC7 | "invalid email" shown. | PASS |
| TC8 | "invalid email" shown. | PASS |
| TC9 | "invalid password" shown. | PASS |
| TC10 | "invalid email" shown, so the password is never checked. | FAIL |

## Root causes

1. **Email regex only accepts 3-letter endings.** `validateEmail` in `src/utils/index.ts` used `/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{3})+$/`. The last group, `(\.\w{3})+`, means every part after the last dot must be exactly three characters, so `.it`, `.br`, `.ca` and `.info` all fail while `.com` passes. Two of the seeded volunteers (`luigi@carluccio.it`, `john@silva.com.br`) could never log in.
2. **Log in button was never disabled.** The Login screen did not pass `disabled` to `BigButton`, and `BigButton` only used `disabled` for its colour, never passing it on to the underlying `RectButton`. So even a disabled `BigButton` would still respond to taps.

## Unit test results

| When | Commit | `npm test` |
|---|---|---|
| Before the fix | `ef8bbad` (tests added) | 13 failed, 15 passed, 28 total |
| After the email fix | `e0c78f5` | 2 failed (disabled button), 26 passed |
| After the button fix | `aeb12ea` | 28 passed, 28 total |

## Results after the fix (manual, on device)

| # | Actual result | Status |
|---|---|---|
| TC1 | Log in button is greyed out. Tapping it does nothing. | PASS |
| TC2 | Log in button stays greyed out. | PASS |
| TC3 | No "invalid email". Login succeeds and the events map screen opens (see known issue). | PASS |
| TC4 | No "invalid email". Login succeeds and the events map screen opens (see known issue). | PASS |
| TC5 | Login succeeds and the events map screen opens (see known issue). | PASS |
| TC6 | Email accepted after trimming and lower-casing. The events map screen opens (see known issue). | PASS |
| TC7 | "invalid email" is shown. | PASS |
| TC8 | "invalid email" is shown. | PASS |
| TC9 | "invalid password" is shown. | PASS |
| TC10 | The email passes validation and an "Incorrect password" alert is shown. | PASS |

Tested on a Pixel 9 (Android 17) in Expo Go 57.0.9.

**Before-fix results:** TC3 was reproduced on this device. The other rows in the before-fix table come from reading the original code and from the failing unit tests.

## Known issue (not part of this fix)

After login, the events map screen opens but the map itself is blank: a light grey background with the Google logo. The device log shows `Google Android Maps SDK: Authorization failure`. The project has no Google Maps API key of its own, so the map tiles do not load in this test environment. Login and navigation to the screen are not affected. The map needs its own API key setup, which is outside the scope of this login fix.
