# gerDa
## a.k.a. löpbanDet 2.0

Att jobba med LaTeX är jobbigt, så denna tjänst finns till för att göra det lättare för gemene sektionsmedlem att [motionera](https://sv.wiktionary.org/wiki/motionera).

I denna container finns allting färdigpackat för att du ska kunna generera dokument i enlighet med mallar för D-sek.

## Hur bygger man det?
Se till att Docker är installerat
```bash
git clone git@github.com:alfredgrip/gerDa.git
cd gerDa
docker build . -t gerda
docker run --name gerda -p 3000:3000 gerda:latest
```
Programmet använder sig av port 3000 i vanliga fall, ändra i källkoden för att använda någon annan.

## Bra länkar
https://en.wikibooks.org/wiki/LaTeX/Installing_Extra_Packages#Manual_installation

## Cred
99% av alla LaTeX-filer och grafik är inte gjorda av mig, utan lånade från följande repo: https://github.com/Dsek-LTH/dsek-latex.

Ändringar gjorda av mig inkluderar en uppdaterad `latexmkrc` samt att en **att-lista** numera har numrerade att-satser.
