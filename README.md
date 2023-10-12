# gerDa

## a.k.a. löpbanDet 2.0

Att jobba med LaTeX är jobbigt, så denna tjänst finns till för att göra det lättare för gemene sektionsmedlem att [motionera](https://sv.wiktionary.org/wiki/motionera).

I denna container finns allting färdigpackat för att du ska kunna generera dokument i enlighet med mallar för D-sek.

Programmet har stöd för att användaren ska skriva i Markdown, vilket är tämligen mer användarvänligt än LaTex. Detta görs tack vare <https://ctan.org/pkg/markdown>.

## Hur bygger man det?

Se till att Docker är installerat

```bash
git clone git@github.com:alfredgrip/gerDa.git
cd gerDa
docker build . -t gerda
docker run --name gerda -p 3000:3000 gerda:latest
```

Programmet använder sig av port 3000 i vanliga fall, vill du köra på någon annan port ändra det i `docker run`-kommandot enligt:

```bash
docker run --name gerda -p <host port>:3000 gerda:latest
```

Om du vill köra programmet lokalt krävs det att du har `texlive-full` installerat, hänvisa till din lokala pakethanterare för att hitta installationsinstruktioner.
Kommando för att köra det lokalt:

```bash
npm run build
ORIGIN=http://localhost:3000 node fileServer.js
```

## Development

Programmet är skrivet med SvelteKit. För att kunna serva dynamiskt genererade filer till användaren (alltså de genererade pdf:erna) så körs en Express server, se `fileServer.js`

Starta dev-servern med `npm run dev`

Just nu finns det en bugg som gör att i dev-mode hittar inte servern filerna den genererar, för att fixa detta lägg manuellt till `/output/` i URL enligt exempel:

<http://localhost:3000/generatedDocument.pdf> ->

<http://localhost:3000/output/generatedDocument.pdf>

## Bra länkar

- <https://en.wikibooks.org/wiki/LaTeX/Installing_Extra_Packages#Manual_installation>
- <https://github.com/sveltejs/kit/discussions/10162>
- <https://ctan.org/pkg/markdown>

## Cred

99% av alla LaTeX-filer och grafik är inte gjorda av mig, utan lånade från följande repo: <https://github.com/Dsek-LTH/dsek-latex>.

Ändringar gjorda av mig inkluderar en något uppdaterad `latexmkrc`, en **att-lista** numera har numrerade att-satser och 100% färre kinesiska tecken i den genererade filens titel!
