%% D-sek regulatory documentclass

%% Class identification
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{dsekregdoc}[2022/10/06]

\RequirePackage{expl3}

\DeclareOption*{\PassOptionsToClass{\CurrentOption}{dsekdoc}}

\ProcessOptions \relax

\LoadClass{dsekdoc}

\ExplSyntaxOn

% This is the width for the § labels
\dim_new:N \g_dsek_regp_label_dim
\dim_set:Nn \g_dsek_regp_label_dim {40mm}

% This is the width for the § numbers
\dim_new:N \g_dsek_regp_num_dim
\dim_set:Nn \g_dsek_regp_num_dim {4em}

% This is the width of the separation between the § and the content
\dim_new:N \g_dsek_regp_col_sep_dim
\dim_set:Nn \g_dsek_regp_col_sep_dim {1em}

% This is the width of the § column in full.  It is calculated from the
% previous numbers.
\dim_new:N \g__dsek_regp_col_dim
\dim_set:Nn \g__dsek_regp_col_dim \g_dsek_regp_label_dim
\dim_add:Nn \g__dsek_regp_col_dim \g_dsek_regp_num_dim

% Number of the § paragraph
\newcounter{DsekRegParagraph}

% Format for the § number
\tl_new:N \g_dsek_regp_num_format_tl
\tl_set:Nn \g_dsek_regp_num_format_tl {§\arabic{section} . \arabic{DsekRegParagraph}}

\NewDocumentCommand{\setregpnumformat}{ m }{
  \tl_gset:Nn \g_dsek_regp_num_format_tl { #1 }
}

\NewDocumentEnvironment{regsection}{}{
  \setcounter{DsekRegParagraph}{0}

  \begin{description}[
      align=parleft,
      labelindent=0mm,
      labelsep=\g_dsek_regp_col_sep_dim,
      leftmargin=\g__dsek_regp_col_dim + \g_dsek_regp_col_sep_dim,
      labelwidth=\g__dsek_regp_col_dim,
      itemindent=0mm,
      font=\normalfont]
}{
  \end{description}
}

% This command creates a § label from a given number and label
\cs_new_protected:Npn \__dsek_regp_label:nn #1#2 {
  \makebox[\g_dsek_regp_num_dim][l]{\hypertarget{par:#1}{#1}}
  \parbox[t]{\g_dsek_regp_label_dim}{#2}
}

% This is a user facing command that takes the number and name of a § and
% creates an entry in a surrounding `regsection` for it.

\NewDocumentCommand \regitem { o m } {
  \IfValueTF{#1} {
    \item[\__dsek_regp_label:nn{#1}{#2}]
  } {
    \stepcounter{DsekRegParagraph}
    \item[\__dsek_regp_label:nn{\tl_use:N \g_dsek_regp_num_format_tl}{#2} ]
  }
}

% This sets the format for \sections.
\titleformat{\section}{\sffamily\LARGE\bfseries}{\thesection.}{0.5em}{\LARGE}
\titlespacing*{\section}{0mm}{0mm}{2.5mm}

\ExplSyntaxOff
