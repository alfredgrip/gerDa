%%
%% This is file `dsekkallelse.cls',
%% generated with the docstrip utility.
%%
%% The original source files were:
%%
%% dsekkallelse.dtx  (with options: `class')
%% 
%% IMPORTANT NOTICE:
%% 
%% For the copyright see the source file.
%% 
%% Any modified versions of this file must be renamed
%% with new filenames distinct from dsekkallelse.cls.
%% 
%% For distribution of the original source see the terms
%% for copying and modification in the file dsekkallelse.dtx.
%% 
%% This generated file may be distributed as long as the
%% original source files, as listed above, are part of the
%% same distribution. (The sources need not necessarily be
%% in the same archive or directory.)
\NeedsTeXFormat{LaTeX2e} \ProvidesClass{dsekkallelse} \typeout{This is
  dsekkallelse.cls, version 2002-11-23}
\LoadClass[a4paper,11pt]{article}
\RequirePackage{calc}
%\RequirePackage{microtype}
\RequirePackage{lastpage}
\RequirePackage{array}
\RequirePackage{ifthen}
\RequirePackage{tabularx}
\RequirePackage{keyval}
\RequirePackage{booktabs}
\RequirePackage[nopdfbookmarks]{dsekcommon}
\pagestyle{fancy}
\lfoot{}
\cfoot{\footnotesize{\thepage\ (\nohyperpageref{LastPage})}}
\rfoot{}
\newcounter{dagordning}
\setcounter{secnumdepth}{0}
\newcommand{\tidochplats}[2]{%
  \tthdump{%
    \vspace{0mm}%
    \begingroup
    \setlength{\extrarowheight}{2mm}%
    \begin{tabular}{@{}ll}
      \textbf{Tid:}   & #1 \\
      \textbf{Plats:} & #2 \\
    \end{tabular}
  \endgroup}
%%tth:\special{html:<table border="0" class="inpar">}
%%tth:\special{html:  <tr>}
%%tth:\special{html:    <td valign="top"><b>Tid:</b></td>}
%%tth:\special{html:    <td valign="top">}#1\special{html:</td>}
%%tth:\special{html:  </tr>}
%%tth:\special{html:  <tr>}
%%tth:\special{html:    <td valign="top"><b>Plats:</b></td>}
%%tth:\special{html:    <td valign="top">}#2\special{html:</td>}
%%tth:\special{html:  </tr>}
%%tth:\special{html:</table>}
}
\newcommand{\definepunkt}{%
    \newcommand{\punkt}[4][\arabic{dagordning}]{%
      \ifthenelse{\equal{##1}{\arabic{dagordning}}}{%
        \stepcounter{dagordning}}{}%
      \S ##1 & \raggedright ##2 & ##3 & \ifthenelse{\equal{##4}{}}{}{##4} \\}}%
\newenvironment{dagordning}[1][\textwidth]{%
  \begingroup
  \setcounter{dagordning}{0}%
  \newlength{\@cwi}%
  \newlength{\@cwii}%
  \newlength{\@cwiii}%
  \newlength{\@cwiv}%
  \settowidth{\@cwi}{\S 18.8}%
  \settowidth{\@cwiii}{Information}%
  \setlength{\@cwiv}{2cm}%
  \setlength{\@cwii}{#1 - \@cwi - \@cwiii - \@cwiv - 7\tabcolsep}%
  \definepunkt
  \vspace{10mm}%
  \noindent
  \begin{tabular}{@{}p{\@cwi}p{\@cwii}p{\@cwiii}p{\@cwiv}}
    & \small Ärende & \small Åtgärd & \small Bilaga \\ \midrule}
  {\end{tabular}
   \vspace{\baselineskip}
   \endgroup}
\define@key{dagordning}{total}{\def\@doctot{#1}}
\define@key{dagordning}{paragraf}{\def\@doci{p{#1}}}
\define@key{dagordning}{arende}{\def\@docii{p{#1}}}
\define@key{dagordning}{atgard}{\def\@dociii{p{#1}}}
\define@key{dagordning}{bilaga}{\def\@dociv{p{#1}}}
\newenvironment{dagordning*}[1][]{%
  \def\@doctot{\textwidth}
  \def\@doci{l}
  \def\@docii{X}
  \def\@dociii{l}
  \def\@dociv{l}
  \setkeys{dagordning}{#1}%
  \setcounter{dagordning}{0}%
  \definepunkt
  \vspace{2mm}%
  \noindent
  \edef\@coldef{{@{}\@doci\@docii\@dociii\@dociv}}
  \expandafter\tabularx\expandafter\@doctot\@coldef
    & \small Ärende & \small Åtgärd & \small Bilaga \\ \midrule}
  {\endtabularx
   \vspace{\baselineskip}}
\endinput
%%
%% End of file `dsekkallelse.cls'.
