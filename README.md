# Festivs

Live site: https://shreyas463.github.io/festivs/

A holiday card someone can open. The maker starts on the festival closest to today. Pick a festival, write a note, turn on an effect, and send the link. The person who opens it taps the card. The cover lifts and stays up, and the message pops. Save image downloads a picture of the open card.

The link is the card. Festivs does not keep a copy.

## Run it locally

```bash
npm install
npm run dev
```

## Where data sits

| What | Where |
| --- | --- |
| The card | The page address. Names, note, festival, and effects are in the hash. |
| A copy of the card | Nowhere. There is no account and no database. |
| A saved picture | On your device, if you choose Save image. |
| The type | Google Fonts, when the page loads. |
| The request that loads the page | GitHub Pages, the host. |

The privacy page is published with the site, at `privacy.html`.
