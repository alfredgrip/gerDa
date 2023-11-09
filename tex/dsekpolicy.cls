%%% Document class for the policies of the D-guild

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{dsekpolicy}[2023/10/28]

\RequirePackage{expl3}

\ExplSyntaxOn

\DeclareOption*{\PassOptionsToClass{\CurrentOption}{dsekparagraphed}}

\PassOptionsToClass{n}{dsekregdoc}

\ProcessOptions \relax

\LoadClass{dsekregdoc}

% Make the title of all policies start with "Policy för"
\RenewDocumentCommand \settitle { m } {
  \tl_set:Nn \l_tmpa_tl { Policy~för~#1 }
  \tl_set_eq:NN \g_dsek_title_tl \l_tmpa_tl
  \hypersetup{pdftitle = { \tl_use:N \l_tmpa_tl }}
  \title{ \tl_use:N \l_tmpa_tl }
}

% Since the redefined \settitle adds "Policy för", introduce a more intuitive,
% alternative command
\NewDocumentCommand \policyför { m } { \settitle{ #1 } }

\RenewDocumentCommand \maketitle {} {\section*{ \usetitle }}

\setshorttitle{Policy}

\ExplSyntaxOff
