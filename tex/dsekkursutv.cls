%%
%% This is file `dsekkursutv.cls',
%% generated with the docstrip utility.
%%
%% The original source files were:
%%
%% dsekkursutv.dtx  (with options: `class')
%% 
%% IMPORTANT NOTICE:
%% 
%% For the copyright see the source file.
%% 
%% Any modified versions of this file must be renamed
%% with new filenames distinct from dsekkursutv.cls.
%% 
%% For distribution of the original source see the terms
%% for copying and modification in the file dsekkursutv.dtx.
%% 
%% This generated file may be distributed as long as the
%% original source files, as listed above, are part of the
%% same distribution. (The sources need not necessarily be
%% in the same archive or directory.)
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{dsekkursutv}
\typeout{This is dsekkursutv.cls, version 2002-11-09}
\LoadClass[a4paper,11pt]{article}
\RequirePackage{array}
\RequirePackage{lastpage}
\RequirePackage{tabularx}
\RequirePackage[nopdfbookmarks]{dsekcommon}
\pagestyle{fancy}
\lfoot{}
\cfoot{\footnotesize{\thepage\ (\nohyperpageref{LastPage})}}
\rfoot{}
\setcounter{secnumdepth}{0}
\AtBeginDocument{%
  \setheader{STUDIERÅDET}{Kursutvärdering}{\@date}}
\renewcommand{\maketitle}{%
  \section{\@title}

  \begin{tabularx}{\textwidth}{@{}lX}
    Årskurs:         & \@class \\
    Svarsfrekvens:   & \the\@totalevaluees\ / \the\@totalstudents~~%
    (\the\@evalpercentage\,\%) \\
    Sammanställd av: & \@author\ <\@authoruserid @efd.lth.se> \\
  \end{tabularx}
  \par}
\newcommand{\@class}{}
\newcommand{\class}[1]{%
  \renewcommand{\@class}{#1}}
\newcommand{\@authoruserid}{}
\newcommand{\authoruserid}[1]{%
  \renewcommand{\@authoruserid}{#1}}
\newcount\@totalstudents
\newcount\@totalevaluees
\newcount\@evalpercentage
\newcommand{\studentcount}[2]{%
  \@totalevaluees=#1
  \@totalstudents=#2
  \advance\@totalstudents by \@totalevaluees
  \@evalpercentage=\@totalevaluees
  \multiply\@evalpercentage by 100
  \divide\@evalpercentage by \@totalstudents
}
\endinput
%%
%% End of file `dsekkursutv.cls'.
