%%
%% This is file `dsekprotokoll.cls',
%% generated with the docstrip utility.
%%
%% The original source files were:
%%
%% dsekprotokoll.dtx  (with options: `class')
%% 
%% IMPORTANT NOTICE:
%% 
%% For the copyright see the source file.
%% 
%% Any modified versions of this file must be renamed
%% with new filenames distinct from dsekprotokoll.cls.
%% 
%% For distribution of the original source see the terms
%% for copying and modification in the file dsekprotokoll.dtx.
%% 
%% This generated file may be distributed as long as the
%% original source files, as listed above, are part of the
%% same distribution. (The sources need not necessarily be
%% in the same archive or directory.)
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{dsekprotokoll}
\typeout{This is dsekprotokoll.cls, version 2002-08-16}
\LoadClass[a4paper,11pt]{article}
\RequirePackage{calc}
\RequirePackage{ifthen}
\RequirePackage{lastpage}
\RequirePackage{longtable}
\RequirePackage{array}
\RequirePackage{nameref}
\RequirePackage{parskip}
\RequirePackage[pdfbookmarks, pdfmarginkern]{dsekcommon}
\newcommand{\paragraf@tocdepth}{}
\newcommand{\protokoll@envname}{}
\DeclareOption{protokoll}{%
  \renewcommand{\paragraf@tocdepth}{1}
  \renewcommand{\protokoll@envname}{protokoll}}
\DeclareOption{stadgar}{%
  \renewcommand{\paragraf@tocdepth}{2}
  \renewcommand{\protokoll@envname}{stadgeavsnitt}}
\ExecuteOptions{protokoll}
\ProcessOptions
\pagestyle{fancy}
\lhead{}
\chead{}
\rhead{}
\lfoot{}
\cfoot{\thepage{} (\nohyperpageref{LastPage})}
\rfoot{}
\newlength{\numbercollength}
\newlength{\subjectcollength}
\newcommand{\columnwidths}[2]{
  \setlength{\numbercollength}{#1}
  \setlength{\subjectcollength}{#2}}
\columnwidths{11mm}{38mm}
\newlength{\paragraf@extraskip}
\newenvironment{\protokoll@envname}{%
  \setlength{\paragraf@extraskip}{0mm}
  \begin{list}{}{%
      \newcommand{\parnumber}{}%
      \setlength{\labelwidth}{\numbercollength + \subjectcollength}%
      \setlength{\leftmargin}{\labelwidth + \labelsep}%
      \renewcommand{\makelabel}[1]{%
        \ifpdf
          \pdfbookmark[\paragraf@tocdepth]{%
            \S\parnumber{} ##1}{par:\parnumber}%
          \hypertarget{par:\parnumber}{}%
        \fi
        \ifpdf
          \phantomsection
        \fi
        \renewcommand{\@currentlabelname}{##1}%
        \label{par:\parnumber}%
        \raisebox{0pt}[1ex][0pt]{%
          \makebox[\labelwidth][l]{%
            \parbox[t]{\numbercollength}{\S\parnumber}%
            \parbox[t]{\subjectcollength}{%
              \raggedright\hspace{0pt}##1}}}\hfill}%
      \newcommand{\paragraf}[3][0]{%
        \vspace{\the\paragraf@extraskip}%
        \setlength{\paragraf@extraskip}{##1\baselineskip}%
        \renewcommand{\parnumber}{##2}%
        \item[##3]}}}{%
    \vspace{\the\paragraf@extraskip}%
  \end{list}}
\renewcommand{\maketitle}{%
  \section*{\@title}}
\newenvironment{narvaro}{%
  \newcommand{\narvaro@caption}{\textbf{Närvaro:}}%
  \newcommand{\person}[3][]{%
    \narvaro@caption &
    \ifthenelse{\equal{##1}{}}{##2}{\personakt{##2}{##1}} & ##3 \\
    \renewcommand{\narvaro@caption}{}}%
  \begin{longtable}[l]{@{}lll}}{%
  \end{longtable}}
\newcommand{\beslot}{\textbf{beslöt}\xspacedsek}
\newcommand{\Beslot}{\textbf{Beslöt}\xspacedsek}
\newcommand{\parref@star}[1]{%
  \ifpdf
    \hyperlink{par:#1}{\S#1}%
  \else
    \S#1%
  \fi}%
\newcommand{\parref@nostar}[1]{%
  \ifpdf
    \hyperlink{par:#1}{\S#1~\nameref{par:#1}}%
  \else
    \S#1~\nameref{par:#1}%
  \fi}%
\newcommand{\parref}{%
  \@ifstar{\parref@star}{\parref@nostar}}
\endinput
%%
%% End of file `dsekprotokoll.cls'.
