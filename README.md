# Gerda

## a.k.a. löpbanDet 2.0

Att jobba med LaTeX kan vara jobbigt, så detta program finns till för att göra det lättare för gemene sektionsmedlem att [motionera](https://sv.wiktionary.org/wiki/motionera)!

## Dokumentation

### Backend

Händelseförloppet för när backend tar emot en request ser ungefär ut enligt:

1. Validera inkommande data.
2. För varje sträng i datan, skicka den genom `pandoc` som omvandlar eventuell Markdown till LaTeX. Detta gör att användaren av programmet kan skriva i Markdown istället för LaTeX.
3. Fyll i LaTeX-mall med data från klienten och skapa en LaTeX-fil.
4. Kompilera LaTeX-filen till PDF, och skicka tillbaka PDF:en till klienten.

### API

Programmet har ett öppet api som kan användas för att generera PDFer eller LaTeX-filer utan att använda frontend. För att göra detta, skicka en POST-request till `/api/generate` med en FormData-body som matchar schemat i `schemas.ts`. Exempelvis:

```bash
curl -X POST http://localhost:3000/api/generate \
  -F 'data={
  "output": "pdf",
  "documentClass": "motion",
  "title": "Min motion",
  "body": "Detta är min motion.",
  "meeting": "S03",
  "clauses": [{ "toClause": "sjunga mer" }],
  "authors": [
      { "name": "Rosa Pantern", "position": "abc", "signMessage": "Lund" }
    ]
  };type=application/json' \
  -F 'authors[0].signImage=@/absolute/path/to/my/file.jpg;type=image/jpeg' \
  --output motion.pdf
```

### Frontend

Programmets grund är själva formuläret som skickar datan till backend. Alla olika typer av dokumentmallar delar ett och samma formulär (`src/routes/create/+layout.svelte`), och sedan för varje konkret dokumentmall så finns relevanta input, e.x. (`src/routes/create/motion/+page.svelte`).

Programmet använder sig av SvelteKits **remote functions** för att skapa formuläret. Formuläret tar emot två typer av requests, bestämda av parametern `output`, vars värden kan vara antingen `pdf` eller `latex`. `output`-parametern får sitt värde genom de två olika knapparna för PDF respektive LaTeX, som finns i `Toolbar.svelte`.

Användaren kan spara sitt arbete i utkast ("drafts"). Dessa sparas i webbläsarens localstorage. Nackdelar med detta är att data inte synkroniseras mellan olika enheter. Fördelarna är att det inte krävs någon databas, användarkonto eller autentisering.

## Dokumentmallar

De dokumentmallar som Gerda erbjuder är en utökning av de dokumentmallar som defineras i [sektionens LaTeX-mallar](https://github.com/Dsek-LTH/dsekdocs), som hela det här programmet bygger på. Om man vill ändra i mallarna så måste man uppdatera schemat i `schemas.ts`, uppdatera LaTeX-mallen i `latexTemplates.ts`, och vill man skapa en ny mall måste man även lägga till en ny route och en entry för den på programmets landing page så användare kan navigera dit.

OBS! När en mall ändras så är det viktigt att se till att alla HTML-input har rätt `name`-attribut som matchar det som förväntas i schemat.

För att smidigt kunna kunna skicka data i form av Arrayer, använd `ArrayTextInput.svelte`, som wrappar lite logik för att hantera arrayer i formuläret. De olika elementen separeras med radbrytning (`\n`).

## Development

För att köra programmet lokalt behövs [Pandoc](https://pandoc.org) och [Tectonic](https://tectonic-typesetting.github.io/) installerat. Pandoc används för att översätta Markdown till LaTeX, och Tectonic är själva LaTeX-kompilatorn. Varför Tectonic när det finns så många andra? Tectonic är ganska modern, snabb, och kan automatiskt ladda ner alla LaTeX-paket som behövs vid runtime, och såklart är den (delvis) skriven i Rust.

Programmet är såklart beroende av sektionens LaTeX-paket [dsekdocs](https://github.com/Dsek-LTH/dsekdocs), så det är lagt som en Git submodule. För att klona ner det med submodules, använd

```bash
git submodule init && git submodule update && git pull
```

Starta dev-servern med

```bash
pnpm dev
```

Alternativt starta det via Docker

```bash
docker build . -t gerda
docker run --name gerda -p <host port>:3000 gerda:latest
```

## Deployment

Programmet kan stoppas i en Docker-container med hjälp av `Dockerfile`. Se till att värdena i den är rätt. Någonting med PDF:er och CORS gör att i production så sätts `ORIGIN=http://localhost:3000`. Porten kan uppdateras fritt, men url:en bör fortfarande vara `localhost`, inte `gerda.dsek.se` eller liknande.

`Dockerfile` definierar en `BODY_SIZE_LIMIT` på 10MB, vilket är ganska stort, men krävs för att kunna ta emot bilder via API:et.

Även CRSF/CORS har ändrats för att tillåta alla origins.
Se `svelte.config.js` och [SvelteKits dokumentation](https://svelte.dev/docs/kit/configuration#csrf).
