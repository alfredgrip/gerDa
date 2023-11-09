%%% D-sek doc documentclass

%% Class identification
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{dsekdoc}[2022/06/12]

\RequirePackage{expl3}

\ExplSyntaxOn

%% Declaration of options
\bool_new:N \g_dsek_in_english_bool
\DeclareOption{english}{\bool_set_true:N \g_dsek_in_english_bool}

\PassOptionsToClass{a4paper}{article}
\PassOptionsToClass{11pt}{article}
\DeclareOption*{\PassOptionsToClass{\CurrentOption}{article}}

\bool_new:N \g_dsekdoc_shadow_maketitle_bool
\bool_set_true:N \g_dsek_shadow_maketitle_bool

\DeclareOption{maketitle}{\bool_set_false:N \g_dsek_in_color_bool}

\ExplSyntaxOff

%% Execution of options
\ProcessOptions \relax

\LoadClass{article}

%% Require packages
\RequirePackage{fontspec}
\RequirePackage{polyglossia}
\RequirePackage[bw]{dsek}
\RequirePackage{calc}
\RequirePackage[
  textwidth  = 160mm,
  textheight = 230mm,
  top        = (1in - 15mm),
  includehead,
  headsep    = 20mm,
  headheight = 16mm
]{geometry}
\RequirePackage[pagestyles]{titlesec}
\RequirePackage[
  colorlinks=true,
  bookmarks=true,
  bookmarksnumbered=true,
  bookmarksopen=true,
  bookmarksopenlevel=3
]{hyperref}
\RequirePackage{lastpage}

%% Font configuration
\setmainfont{Domitian-Roman.otf}[
  Numbers=OldStyle,
  BoldFont=Domitian-Bold.otf,
  ItalicFont=Domitian-Italic.otf,
  BoldItalicFont=Domitian-BoldItalic.otf]
\setsansfont{texgyreheros-regular.otf}[
  Scale=MatchLowercase,
  BoldFont=texgyreheros-bold.otf,
  ItalicFont=texgyreheros-italic.otf,
  BoldItalicFont=texgyreheros-bolditalic.otf]
\providefontfamily\tffamily{Domitian-Roman.otf}

\ExplSyntaxOn
%% Languages

\bool_if:NTF \g_dsek_in_english_bool {
  \setmainlanguage{english}
  \setotherlanguage{swedish}
} {
  \setmainlanguage{swedish}
  \setotherlanguage{english}
}

%% Section styling
\titleformat*{\section}{\Large\sffamily\bfseries}
\titleformat*{\subsection}{\large\sffamily\bfseries}
\titleformat*{\subsubsection}{\sffamily\bfseries}


%% Paragraph styling
\titleformat*{\paragraph}{\sffamily\bfseries}
\titleformat*{\subparagraph}{\sffamily\bfseries}
\setlength{\parindent}{0mm}
\setlength{\parskip}{3mm}

%% Document properties

% Title

\tl_new:N \g_dsek_title_tl

\NewDocumentCommand \settitle { m } {
  \tl_set:Nn \g_dsek_title_tl { #1 }
  \hypersetup{pdftitle = { #1 }}
  \title{ #1 }
}

\NewDocumentCommand \usetitle {} {
  \tl_use:N \g_dsek_title_tl
}

% Short Title

\tl_new:N \g_dsek_short_title_tl

\NewDocumentCommand \setshorttitle { m }{
  \tl_set:Nn \g_dsek_short_title_tl { #1 }
}

\NewDocumentCommand \useshorttitle {} {
  \tl_use:N \g_dsek_title_tl
}

% Date

\tl_new:N \g_dsek_date_tl

\NewDocumentCommand \setdate { m }{
  \tl_set:Nn \g_dsek_date_tl { #1 }
  \date{ #1 }
}

\NewDocumentCommand \usedate {} {
  \tl_use:N \g_dsek_date_tl
}

% Author

\tl_new:N \g_dsek_author_tl

\NewDocumentCommand \setauthor { m } {
  \tl_set:Nn \g_dsek_author_tl { #1 }
  \hypersetup{pdfauthor = { #1 }}
  \author{ #1 }
}

\NewDocumentCommand \useauthor {} {
  \tl_use:N \g_dsek_author_tl
}

% Meeting

\tl_new:N \g_dsek_meeting_tl

\NewDocumentCommand \setmeeting { m }{
  \tl_set:Nn \g_dsek_meeting_tl { #1 }
}

\NewDocumentCommand \usemeeting {} {
  \tl_use:N \g_dsek_meeting_tl
}

% Cover page text

\tl_new:N \g_dsek_covp_text_tl

\NewDocumentCommand \setcovptext { m } {
  \tl_set:Nn \g_dsek_covp_text_tl { #1 }
}

\NewDocumentCommand \usecovptext {} {
  \tl_use:N \g_dsek_covp_text_tl
}

%% Cover page

\NewDocumentCommand \coverpage {} {
  \begin{titlepage}
    \begin{center}
      \vspace{10mm}
      \textsc{\Huge \Dseklongname} \\[5mm]
      \rule{\linewidth}{1pt} \\[4mm]
      \Huge \tl_use:N \g_dsek_title_tl \\
      \rule{\linewidth}{1pt} \\
      \vspace{5mm}
      \tl_if_empty:NF \g_dsek_covp_text_tl
      {\Large \tl_use:N \g_dsek_covp_text_tl \\[20mm]}
      \Dseksigil[color, height=70mm]
    \end{center}
  \end{titlepage}
}

\bool_if:NT \g_dsek_shadow_maketitle_bool {
  \RenewDocumentCommand \maketitle {} { \coverpage }
}

%% Headers and footers

\newpagestyle{main}{
  \sethead {
    \parbox{18mm}{\Dseksigil[height=16mm]}
    \parbox{80mm}{{\textsc{\Dseklongname}} \\
      {\small\textsc{\tl_use:N \g_dsek_short_title_tl}}}
  }{}{
    \parbox{60mm}{\small
      \hbox{} \hfill{\tl_use:N \g_dsek_meeting_tl} \\
      \hbox{} \hfill{\tl_use:N \g_dsek_date_tl}}
  }
  \setheadrule{0pt}
  \setfootrule{.4pt}
  \setfoot{}{\tffamily\thepage\ (\pageref{LastPage})}{}
}
\pagestyle{main}

%% LTH symbols

\newfontfamily{\lthsymbols}{lthsymbols}[Extension = .otf]
\NewDocumentCommand \lthsymbol { m } {
  {\lthsymbols #1}
}

\NewDocumentCommand \tlth { } {
  \lthsymbol{T}
}
\NewDocumentCommand \fsek { } {
  \lthsymbol{F}
}
\NewDocumentCommand \esek { } {
  \lthsymbol{E}
}
\NewDocumentCommand \msek { } {
  \lthsymbol{M}
}
\NewDocumentCommand \vsek { } {
  \lthsymbol{V}
}
\NewDocumentCommand \asek { } {
  \lthsymbol{A}
}
\NewDocumentCommand \ksek { } {
  \lthsymbol{K}
}
\NewDocumentCommand \dsek { } {
  \lthsymbol{D}
}
\NewDocumentCommand \doktsek { } {
  \lthsymbol{O}
}
\NewDocumentCommand \ingsek { } {
  \lthsymbol{H}
}
\NewDocumentCommand \wsek { } {
  \lthsymbol{W}
}
\NewDocumentCommand \isek { } {
  \lthsymbol{I}
}
\NewDocumentCommand \infocom { } {
  \lthsymbol{c}
}
\NewDocumentCommand \hilbert { } {
  \lthsymbol{h}
}
\NewDocumentCommand \lant { } {
  \lthsymbol{l}
}
\NewDocumentCommand \brand { } {
  \lthsymbol{b}
}
\NewDocumentCommand \td { } {
  \lthsymbol{t}
}

\ExplSyntaxOff
