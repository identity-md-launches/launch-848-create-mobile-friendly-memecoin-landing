# Asset and reference attribution

## Profile photograph

`public/assets/pepes-profile.jpg` is the 400×400 profile image for the user-specified [@pepes_imd account](https://x.com/pepes_imd), downloaded on 2026-10-06 from [X's image CDN](https://pbs.twimg.com/profile_images/2107552642201190402/OdMuYhto_400x400.jpg). The exact CDN identifier was discovered from the account's public metadata through `https://api.fxtwitter.com/pepes_imd`. The original image is bundled without editing; CSS displays it in a circle. It is used as the requested brand reference. No ownership or open-source license for that photograph is asserted.

The decorative background frog and interface SVGs are code-native artwork created for this implementation. They do not make runtime requests.

## Fonts

- Lilita One, Latin WOFF2, from Google Fonts: `https://fonts.gstatic.com/s/lilitaone/v17/i7dPIFZ9Zz-WBtRtedDbYEF8RQ.woff2`.
- Nunito, Latin variable WOFF2, weights 400–800, from Google Fonts: `https://fonts.gstatic.com/s/nunito/v32/XRXV3I6Li01BKofINeaB.woff2`.

Both are under the SIL Open Font License 1.1. Their original notices are included at `public/assets/LICENSE-lilita-one.txt` and `public/assets/LICENSE-nunito.txt`, and copied into the production export. The source notices were retrieved from the corresponding `ofl/lilitaone/OFL.txt` and `ofl/nunito/OFL.txt` files in the Google Fonts repository. The original files and their notices remain unmodified.

## Design and documentation references

The design review used the assignment's pinned Better Interface guide, adapted from [Jakub Krehel's Better Interface](https://github.com/jakubkrehel/skills/tree/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-interface), commit `267330e1adfc66a718fb65fa6918c1f06d0a689e`, MIT, copyright 2026 Jakub Krehel.

The implemented design documentation follows the pinned adaptation of [Paul Bakaus's Impeccable documentation method](https://github.com/pbakaus/impeccable/blob/9d715cc4f5564a990ca8345abfdd5df6dc9b41c8/skill/reference/document.md), commit `9d715cc4f5564a990ca8345abfdd5df6dc9b41c8`, Apache-2.0, copyright 2025 Paul Bakaus. `DESIGN.md` is newly written for this site from the final source and measured results, using the reference's documentation structure.

The supplied combined license notice for these two distinct works is preserved at `docs/licenses/better-interface.txt`. Each retains its own license. The pinned inputs themselves are not runtime dependencies and are not part of the submitted site.
