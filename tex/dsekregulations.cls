%%% Document class for the regulations of the D-guild

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{dsekregulations}[2023/10/28]

\RequirePackage{expl3}

\ExplSyntaxOn

\DeclareOption*{\PassOptionsToClass{\CurrentOption}{dsekparagraphed}}

\PassOptionsToClass{t}{dsekregdoc}

\ProcessOptions \relax

\LoadClass{dsekregdoc}

\settitle{Reglemente}
\setshorttitle{Reglemente}

\setcovptext{
  {\tl_use:N \g_dsek_adopted_on_tl}. \\
  {\tl_use:N \g_dsek_revised_on_tl}.}

\ExplSyntaxOff
