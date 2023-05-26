%%
%% This is file `dsekddu.cls',
%% generated with the docstrip utility.
%%
%% The original source files were:
%%
%% dsekddu.dtx  (with options: `class')
%% 
%% IMPORTANT NOTICE:
%% 
%% For the copyright see the source file.
%% 
%% Any modified versions of this file must be renamed
%% with new filenames distinct from dsekddu.cls.
%% 
%% For distribution of the original source see the terms
%% for copying and modification in the file dsekddu.dtx.
%% 
%% This generated file may be distributed as long as the
%% original source files, as listed above, are part of the
%% same distribution. (The sources need not necessarily be
%% in the same archive or directory.)
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{dsekddu}
\typeout{This is dsekddu.cls, version 2003-09-23}
\LoadClass[a5paper,10pt]{article}
\RequirePackage{fancyhdr}
\RequirePackage{calc}
\RequirePackage{array}
\RequirePackage{multicol}
\RequirePackage{ifthen}
\RequirePackage{booktabs}
\RequirePackage{dsekcommon}
\setlength{\topmargin}{-35mm}
\setlength{\headsep}{16pt}
\setlength{\footskip}{6mm}
\setlength{\textheight}{180mm}
\setlength{\textwidth}{132mm}
\setlength{\oddsidemargin}{-17mm}
\setlength{\evensidemargin}{-17mm}
\setlength{\marginparsep}{6pt}
\setlength{\parskip}{0pt}
\setlength{\parindent}{1.5em}
\raggedcolumns
\newcommand{\nollning}[1]{#1}
\newcommand{\@issue}{}
\newcommand{\@semester}{}
\newcommand{\issue}[2]{%
  \renewcommand{\@issue}[1]{#1}
  \renewcommand{\@semester}[1]{#2}}
\newcommand{\@publisher}{}
\newcommand{\@publisheruserid}{}
\newcommand{\publisher}[2]{%
  \renewcommand{\@publisher}{#1}
  \renewcommand{\@publisheruserid}{#2}}
\newcommand{\@editor}{}
\newcommand{\@editoruserid}{}
\newcommand{\editor}[2]{%
  \renewcommand{\@editor}{#1}%
  \renewcommand{\@editoruserid}{#2}%
  \author{#1}}
\newcommand{\@nextdeadline}{n^^e4sta s^^f6ndag}
\newcommand{\nextdeadline}[1]{%
  \renewcommand{\@nextdeadline}{#1}}
\newcommand{\@ddulogo}{}
\newcommand{\ddulogo}[1]{%
  \renewcommand{\@ddulogo}{#1}}
\newcommand{\@dduwww}{WWW:}
\newcommand{\dduwww}[1]{%
  \renewcommand{\@dduwww}{#1}}
\newcommand{\@punchline}{}
\newcommand{\punchline}[1]{%
  \renewcommand{\@punchline}{#1}}
\AtEndDocument{\makepunchline}
\newcommand{\makepunchline}{%
  \ifthenelse{\equal{\@punchline}{}}{}{%
    \par\vfill
    \begin{center}
      \emph{\@punchline}
    \end{center}}}
\newcommand{\sign}[1]{%
  \par
  \penalty 6000
  \begin{flushright}
    \textit{#1}
  \end{flushright}}
\clubpenalty=3000
\widowpenalty=3000
\newcommand{\greeting}[2]{%
  \par
  \vspace{0.7\baselineskip}%
  \penalty 6000
  \noindent\parbox{\columnwidth}{%
    \noindent
    \textit{#1}
    \begin{flushright}
      \textit{\indent#2}
    \end{flushright}}}
\renewcommand{\subsection}[1]{%
  \vspace{0.7\baselineskip}
  \noindent{\sffamily\bfseries #1}\\*}
\setcounter{secnumdepth}{0}
\pagestyle{fancy}
\lhead{}
\chead{}
\rhead{}
\lfoot{}
\cfoot{}
\rfoot{}
\setlength{\headwidth}{\textwidth}
\setlength{\heavyrulewidth}{\lightrulewidth}
\AtBeginDocument{\setddufooter}
\newcommand{\setddufooter}{%
  \lfoot{\scriptsize Bidrag sändes till ddu@dsek.se senast \@nextdeadline}
  \cfoot{}
  \rfoot{\scriptsize \@dduwww: https://www.dsek.se/sektionen/propm/ddu/}}
\renewcommand{\maketitle}{%
  \tthdump{%
    \begin{center}
      \ifthenelse{\equal{\@ddulogo}{}}{\Dlogo[25mm]}{%
        \includegraphics[height=25mm]{%
          \@ddulogo}}%
      \vspace{3mm}
    \end{center}
    {\scriptsize
      \vspace{-10mm}
      \newlength{\sidewidth}
      \newlength{\centerwidth}
      \setlength{\centerwidth}{55mm}
      \setlength{\sidewidth}{(\textwidth-\centerwidth-4\columnsep)/2}
      \begin{center}
        \begin{tabular}{%
            p{\sidewidth}>{\hfill}p{\centerwidth}>{\hfill}p{\sidewidth}}
          \toprule
          Nummer \@issue & Information och sånt för LTH:s D-sektion\hfill~
          & Redaktör: \\
          \@semester~ & Ansvarig utgivare: \@publisher~\hfill~ & \@author\\
          \bottomrule
        \end{tabular}
      \end{center}}}}
\endinput
%%
%% End of file `dsekddu.cls'.
