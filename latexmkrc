$pdf_mode = 1;
$pdflatex = 'lualatex -interaction=nonstopmode';

ensure_path( 'TEXINPUTS', './dsekdocs//' );
ensure_path( 'BSTINPUTS', './bst//' );
ensure_path( 'T1FONTS', './dsekdocs/fonts/type1//' );
ensure_path( 'AFMFONTS', './dsekdocs/fonts/afm//' );
ensure_path( 'TEXFONTMAPS', './dsekdocs/fonts/map//' );
ensure_path( 'TFMFONTS', './dsekdocs/fonts/tfm//' );
ensure_path( 'VFFONTS', './dsekdocs/fonts/vf//' );
ensure_path( 'ENCFONTS', './dsekdocs/fonts/enc//' );