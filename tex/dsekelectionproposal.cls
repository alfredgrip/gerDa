\NeedsTeXFormat{LaTeX2e}

\ProvidesClass{dsekelectionproposal}

\RequirePackage{expl3}
\RequirePackage{multicol}

\DeclareOption*{\PassOptionsToClass{\CurrentOption}{dsekdoc}}

\ProcessOptions \relax

\LoadClass{dsekdoc}

\ExplSyntaxOn

\setshorttitle{Valberedningens~förslag}

\NewDocumentEnvironment{vemsection}{ } {
  \section*{Valberedningens~förslag~inför~\usemeeting}
  Valberedningens~förslag~inför~\usemeeting\phantom{}~är~följande:
  \begin{multicols}{2}
    } {
  \end{multicols}
  \vspace{\baselineskip}
}
\NewDocumentCommand \getenumcount { m } {
  \getrefnumber{#1}
}
\NewDocumentEnvironment{vemlist}{ m } {
  \begin{minipage}{\columnwidth}
    \ifnum\getenumcount{#1}>3 {
    \textbf{#1}~(\,\getenumcount{#1}~st\,)
    }\else {
      \textbf{#1}
    }
    \fi
    \vspace{-0.5em}
    \begin{enumerate}[label=\textbullet]
      \setlength\itemsep{-0.25em}
      } {
      \edef\@currentlabel{\arabic{\@enumctr}}\label{#1}
    \end{enumerate}
  \end{minipage}
}

\NewDocumentEnvironment{statistikpage}{ } {
  \newpage
  \section*{Valstatistik}
  Nedan~presenteras~antalet~personer~som~genomgick~valprocessen~i~intervall~om~storlek~fem.
  \vspace{\baselineskip}
  \begin{multicols}{2}
    } {
  \end{multicols}
}

\NewDocumentCommand \statistik { m m } {
  \begin{minipage}{\columnwidth}
    \textbf{#1:}~#2~st
    \vspace{\baselineskip}
  \end{minipage}
}

\ExplSyntaxOff

