%%
%% This is file `dsekhermann.cls',
%% generated with the docstrip utility.
%%
%% The original source files were:
%%
%% dsekhermann.dtx  (with options: `class')
%% 
%% IMPORTANT NOTICE:
%% 
%% For the copyright see the source file.
%% 
%% Any modified versions of this file must be renamed
%% with new filenames distinct from dsekhermann.cls.
%% 
%% For distribution of the original source see the terms
%% for copying and modification in the file dsekhermann.dtx.
%% 
%% This generated file may be distributed as long as the
%% original source files, as listed above, are part of the
%% same distribution. (The sources need not necessarily be
%% in the same archive or directory.)
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{dsekhermann}
\typeout{This is dsekhermann.cls, version 2002-05-19}
\LoadClass[a4paper,12pt]{article}
\RequirePackage[T1]{fontenc}
\RequirePackage[swedish]{babel}
\RequirePackage{dsekcommands}
\RequirePackage{palatino}
\RequirePackage{parskip}
\RequirePackage{ifthen}
\RequirePackage{fancyhdr}
\RequirePackage[left=20mm,right=20mm,top=10mm,bottom=10mm,footskip=16mm,
                nohead]{geometry}
\pagestyle{fancy}
\lhead{}
\chead{}
\rhead{}
\lfoot{\af@foot@font Datatekniksektionen inom TLTH}
\cfoot{}
\rfoot{\af@foot@font www.dsek.lth.se}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0.5pt}
\newcounter{af@title@minsize}
\newcounter{af@title@maxsize}
\newcounter{af@title@size}
\newlength{\af@title@width}
\newcommand{\settitlesizebounds}[2]{%
  \setcounter{af@title@minsize}{#1}
  \setcounter{af@title@maxsize}{#2}}
\settitlesizebounds{40}{80}
\newcommand{\af@title@font}{%
  \fontsize{\value{af@title@size}}{2\value{af@title@size}}\selectfont
  \sffamily\bfseries}
\newcommand{\af@foot@font}{%
  \af@bullets@font}
\newcommand{\af@intro@font}{%
  \normalfont\fontsize{30}{40}\selectfont}
\newcommand{\af@bullets@font}{%
  \normalfont\fontsize{20}{30}\selectfont}
\newcommand{\af@sign@font}{%
  \af@bullets@font}
\newcommand{\af@comment@font}{%
  \af@bullets@font}
\renewcommand{\maketitle}{%
  \hfill\Dlogo[50mm]
  \vspace{10mm}\par
  \setcounter{af@title@size}{\value{af@title@maxsize}}%
  \settowidth{\af@title@width}{\af@title@font\@title}%
  \whiledo{\lengthtest{\af@title@width}>\textwidth}{%
    \addtocounter{af@title@size}{-1}%
    \settowidth{\af@title@width}{\af@title@font\@title}}%
  \ifthenelse{\value{af@title@size}<\value{af@title@minsize}}{%
    \setcounter{af@title@size}{\value{af@title@minsize}}}{}%
  \typeout{Selected \theaf@title@size pt size for the poster title.}%
  {\af@title@font\@title}%
  \vspace{20mm minus 10mm}}
\newcommand{\sign}[2]{%
  \par
  \vfill
  \af@sign@font
  #1 <#2>}
\newcommand{\intro}[1]{%
  \par
  \af@intro@font
  #1
  \par}
\newcommand{\comment}[1]{%
  \par
  \af@comment@font
  #1
  \par}
\newenvironment{bullets}{%
  \vfill
  \begin{itemize}
    \af@bullets@font}{%
  \end{itemize}}
\raggedright
\raggedbottom
\endinput
%%
%% End of file `dsekhermann.cls'.
