$pdf_mode = 1;
$pdflatex = 'pdflatex -interaction=nonstopmode';
$max_repeat = 10;

ensure_path( 'TEXINPUTS', './tex//' );
ensure_path( 'BSTINPUTS', './bst//' );
ensure_path( 'T1FONTS', './tex/fonts/type1//' );
ensure_path( 'AFMFONTS', './tex/fonts/afm//' );
ensure_path( 'TEXFONTMAPS', './tex/fonts/map//' );
ensure_path( 'TFMFONTS', './tex/fonts/tfm//' );
ensure_path( 'VFFONTS', './tex/fonts/vf//' );
ensure_path( 'ENCFONTS', './tex/fonts/enc//' );