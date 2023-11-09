%%% Document clas for the statutes of the D-guild

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{dsekstatutes}[2023/10/28]

\RequirePackage{expl3}

\ExplSyntaxOn

\DeclareOption*{\PassOptionsToClass{\CurrentOption}{dsekparagraphed}}

\PassOptionsToClass{plural}{dsekregdoc}

\ProcessOptions \relax

\LoadClass{dsekregdoc}

\settitle{Stadgar}
\setshorttitle{Stadgar}

\setcovptext{
  {\tl_use:N \g_dsek_adopted_on_tl}. \\
  {\tl_use:N \g_dsek_revised_on_tl}.}

\ExplSyntaxOff
