# gerDa

## a.k.a. löpbanDet 2.0

Att jobba med LaTeX är jobbigt, så denna tjänst finns till för att göra det lättare för gemene sektionsmedlem att [motionera](https://sv.wiktionary.org/wiki/motionera).

I denna container finns allting färdigpackat för att du ska kunna generera dokument i enlighet med mallar för D-sek.

Programmet har stöd för att användaren ska skriva i Markdown och LaTeX samtidigt i samma text, tack vare [Pandoc](https://pandoc.org/).

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

Om du vill köra programmet lokalt krävs det att du har `tectonic` och `pandoc` installerat, hänvisa till din lokala pakethanterare för att hitta installationsinstruktioner.
Kommando för att köra det lokalt:

```bash
npm run build
ORIGIN=http://localhost:3000 node fileServer.js
```

## Development

Programmet är skrivet med SvelteKit. För att kunna serva dynamiskt genererade filer till användaren (alltså de genererade pdf:erna) så körs en Express-server samtidigt, se `fileServer.js`

Starta dev-servern med `npm run dev`

## Bra länkar

- <https://en.wikibooks.org/wiki/LaTeX/Installing_Extra_Packages#Manual_installation>
- <https://github.com/sveltejs/kit/discussions/10162>
- <https://stackoverflow.com/a/73821896/13490969>
- <https://pandoc.org/MANUAL.html>

## Cred

Kika in LaTeX-mallarna som används i detta repot: <https://github.com/Dsek-LTH/dsekdocs>
