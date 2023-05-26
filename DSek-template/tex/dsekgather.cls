%%
%% This is file `dsekgather.cls',
%% generated with the docstrip utility.
%%
%% The original source files were:
%%
%% dsekgather.dtx  (with options: `class')
%% 
%% IMPORTANT NOTICE:
%% 
%% For the copyright see the source file.
%% 
%% Any modified versions of this file must be renamed
%% with new filenames distinct from dsekgather.cls.
%% 
%% For distribution of the original source see the terms
%% for copying and modification in the file dsekgather.dtx.
%% 
%% This generated file may be distributed as long as the
%% original source files, as listed above, are part of the
%% same distribution. (The sources need not necessarily be
%% in the same archive or directory.)
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{dsekgather}
\typeout{This is dsekgather.cls, version 2001-11-18}
\DeclareOption{twoside}{%
  \PassOptionsToClass{twoside}{article}}
\ProcessOptions\relax
\LoadClass[a4paper,11pt]{article}
\RequirePackage{eso-pic}
\RequirePackage{pdfpages}
\RequirePackage{lastpage}
\RequirePackage{dsekcommon}
\RequirePackage{booktabs}
\RequirePackage{tabularx}
\RequirePackage[top=10mm,nohead]{geometry}
\newcommand{\setshipoutpicture}{%
  \AddToShipoutPicture{%
    \setlength{\unitlength}{1mm}%
    \if@twoside
      \ifodd\c@page
        \let\page@alignment\hfill
      \else
        \let\page@alignment\relax
      \fi
    \else
      \let\page@alignment\hfill
    \fi
    \put(5,7){\parbox{200mm}{%
      \normalfont\page@alignment
      $\Sigma$ \thepage\ (\nohyperpageref{LastPage})}}}}
\let\org@tableofcontents=\tableofcontents
\renewcommand{\tableofcontents}{%
  \setshipoutpicture
  \org@tableofcontents}
\newcommand{\addpdffile}[6]{%
  \addtocentry{#6}{#2}%
  \ifx\@todfile\undefined\else
    \write\@todfile{\string\docline}
    \write\@todfile{  {#2}{#3}{#4}}
  \fi
  \includepdf[thread=false,#5]{#1}}
\newcommand{\addtocentry}[2]{%
  \clearpage
  \phantomsection
  \addcontentsline{toc}{#1}{#2}}
\newcommand{\tod@h@document}{dokument}
\newcommand{\tod@h@author}{f^^f6rfattare}
\newcommand{\tod@h@filename}{filnamn}
\newcommand{\tod@h@font}{\itshape}
\newcommand{\tableofdocuments}{%
  \begingroup
  \newcommand{\docline}[3]{%
    ##1 & ##2 & \path{##3} \\}
  \IfFileExists{\jobname.tod}{%
    \begin{tabularx}{\textwidth}{Xll}
      \toprule
      {\tod@h@font\tod@h@document} & {\tod@h@font\tod@h@author} &
      {\tod@h@font\tod@h@filename} \\
      \midrule
      \input{\jobname.tod}
      \bottomrule
    \end{tabularx}}{}
  \newwrite\@todfile
  \openout\@todfile=\jobname.tod
  \endgroup}
\includepdfset{pagecommand={\setshipoutpicture}}
\addto\captionsswedish{%
  \renewcommand{\contentsname}{Inneh^^e5llsf^^f6rteckning}}
\pagestyle{empty}
\setcounter{tocdepth}{3}
\setcounter{secnumdepth}{3}
\endinput
%%
%% End of file `dsekgather.cls'.
