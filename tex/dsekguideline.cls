%%% Document class for the guidelines of the D-guild

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{dsekguideline}[2023/10/28]

\RequirePackage{expl3}

\ExplSyntaxOn

\DeclareOption*{\PassOptionsToClass{\CurrentOption}{dsekparagraphed}}

\PassOptionsToClass{n}{dsekregdoc}

\ProcessOptions \relax

\LoadClass{dsekregdoc}

% Make the title of all guidelines start with "Riktlinje för"
\RenewDocumentCommand \settitle { m } {
  \tl_set:Nn \l_tmpa_tl { Riktlinje~för~#1 }
  \tl_set_eq:NN \g_dsek_title_tl \l_tmpa_tl
  \hypersetup{pdftitle = { \tl_use:N \l_tmpa_tl }}
  \title{ \tl_use:N \l_tmpa_tl }
}

% Since the redefined \settitle adds "Riktlinje för", introduce a more
% intuitive, alternative command
\NewDocumentCommand \riktlinjeför { m } {\settitle{ #1 }}

\RenewDocumentCommand \maketitle {} {\section*{ \usetitle }}

\setshorttitle{Riktlinje}

\ExplSyntaxOff
