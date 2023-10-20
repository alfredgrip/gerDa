# dsekdocs: LaTeX files for the D-guild

Version 0.1.1.

## Overview

This package contains the LaTeX files for [the D-guild](https://dsek.se) at the
technical faculty of Lund university.

The following files are included in this package:
  * `dsek.sty` contains macros that are useful for inserting D-guild related
    stuff into any document,
  * `dsekdoc.cls` contains a document class for D-guild documents,
  * `dsekregdoc.cls` contains a document class for the D-guilds regulatory
	documents.

### Compatabilty
This package makes use of the [`fontspec`](https://ctan.org/pkg/fontspec) and
[`polyglossia`](https://ctan.org/pkg/polyglossia) packages, both of which are
incompatible with `pdflatex`. So, to use this package, use `xelatex` or
`lualatex` instead.

## Licensing

The code in this directory belongs to the D-guild and is publically licensed
under the Expat license. See `LICENSE.txt` for more information.
