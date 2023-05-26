$ENV{'TEXINPUTS'}='./tex//:' . $ENV{'TEXINPUTS'}; 
$ENV{'BSTINPUTS'}='./bst//:' . $ENV{'BSTINPUTS'};
$ENV{'T1FONTS'}='./tex/fonts/type1//:' . $ENV{'T1FONTS'};
$ENV{'AFMFONTS'}='./tex/fonts/afm//:' . $ENV{'AFMFONTS'};
$ENV{'TEXFONTMAPS'}='./tex/fonts/map//:' . $ENV{'TEXFONTMAPS'};
$ENV{'TFMFONTS'}='./tex/fonts/tfm//:' . $ENV{'TFMFONTS'};
$ENV{'VFFONTS'}='./tex/fonts/vf//:' . $ENV{'VFFONTS'};
$ENV{'ENCFONTS'}='./tex/fonts/enc//:' . $ENV{'ENCFONTS'};
$ENV{'TZ'}='Europe/Stockholm';
$pdf_mode = 1;
$pdflatex = 'pdflatex -interaction=nonstopmode';

ensure_path( 'TEXINPUTS', './tex//:' );
ensure_path( 'BSTINPUTS', './bst//:' );
ensure_path( 'T1FONTS', './tex/fonts/type1//:' );
ensure_path( 'AFMFONTS', './tex/fonts/afm//:' );
ensure_path( 'TEXFONTMAPS', './tex/fonts/map//:' );
ensure_path( 'TFMFONTS', './tex/fonts/tfm//:' );
ensure_path( 'VFFONTS', './tex/fonts/vf//:' );
ensure_path( 'ENCFONTS', './tex/fonts/enc//:' );