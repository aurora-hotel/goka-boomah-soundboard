git checkout main
git pull origin main
git checkout -b chore/clean-sounds

# verwijder stray file als aanwezig
git rm -f "sounds/sounds" || true

# verwijder alle .ogg in sounds/ (werkt met spaties)
find sounds -type f -iname '*.ogg' -print0 | xargs -0 -r git rm -f

# overschrijf of maak sounds/list.json met de inhoud hierboven
# (je kunt ook de file handmatig openen en de JSON plakken)
cat > sounds/list.json <<'JSON'
[
  "67.mp3",
  "GOKKA BOOMAH.mp3",
  "Crickets.mp3",
  "DoeiDoei.mp3",
  "Emotional.mp3",
  "Fail.mp3",
  "No god.mp3",
  "Sad Trombone.mp3",
  "aaah.mp3",
  "airhorn.mp3",
  "attention.mp3",
  "badum-tss.mp3",
  "croissant.mp3",
  "damn.mp3",
  "dududu.mp3",
  "explosion-sound.mp3",
  "Hema.mp3",
  "Ik niet.mp3",
  "Lit.mp3",
  "Nou.mp3",
  "Siren.mp3",
  "Stfu.mp3",
  "Vasanta.mp3"
]
JSON

git add -A
git commit -m "chore: clean sounds folder — remove ogg and stray file, regenerate list.json"
git push -u origin chore/clean-sounds
