%%% Document clas for regulatory documents for the D-guild

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{dsekregdoc}[2022/10/06]

\RequirePackage{expl3}

\ExplSyntaxOn

%%% Package options

%% Different inflection of type of regulatory document
\str_const:Nn \c_dsek_reg_doc_t_infl_str { t }
\str_const:Nn \c_dsek_reg_doc_n_infl_str { n }
\str_const:Nn \c_dsek_reg_doc_plural_infl_str { plural }

\str_new:N \g_dsek_reg_doc_infl_str
% default to n-inflection
\str_set_eq:NN \g_dsek_reg_doc_infl_str \c_dsek_reg_doc_n_infl_str

%% Declare options for inflection of type of regulatory document
\DeclareOption{n}
   {\str_set_eq:NN \g_dsek_reg_doc_infl_str \c_dsek_reg_doc_n_infl_str}
\DeclareOption{t}
   {\str_set_eq:NN \g_dsek_reg_doc_infl_str \c_dsek_reg_doc_t_infl_str}
\DeclareOption{plural}
   {\str_set_eq:NN \g_dsek_reg_doc_infl_str \c_dsek_reg_doc_plural_infl_str}

\DeclareOption*{\PassOptionsToClass{\CurrentOption}{dsekparagraphed}}

\ProcessOptions \relax

\LoadClass{dsekparagraphed}

%%% Set header values
%% When the document was last revised
\tl_new:N \g_dsek_revised_on_tl

% Different inflections of "revised"
\tl_new:N \g_dsek_revised_term_tl

\tl_set:Nn \g_dsek_revised_term_tl { reviderad }
\str_if_eq:NNT \g_dsek_reg_doc_infl_str \c_dsek_reg_doc_t_infl_str
    {\tl_set:Nn \g_dsek_revised_term_tl { reviderat }}
\str_if_eq:NNT \g_dsek_reg_doc_infl_str \c_dsek_reg_doc_plural_infl_str
    {\tl_set:Nn \g_dsek_revised_term_tl { reviderade }}

\NewDocumentCommand{\setrevisedon}{ m }{
  \tl_gset:Nn \g_dsek_revised_on_tl
     {Senast~{\tl_use:N \g_dsek_revised_term_tl}~#1 }
}

\setrevisedon{HTMX 20XX} % set a default value
\tl_set:Nn \g_dsek_date_tl {\tl_use:N \g_dsek_revised_on_tl} % Add to header

%% When the document was adopted
\tl_new:N \g_dsek_adopted_on_tl

% Different inflections of "adopted"
\tl_new:N \g_dsek_adopted_term_tl

\tl_set:Nn \g_dsek_adopted_term_tl { Antagen }
\str_if_eq:NNT \g_dsek_reg_doc_infl_str \c_dsek_reg_doc_t_infl_str
    {\tl_set:Nn \g_dsek_adopted_term_tl { Antaget }}
\str_if_eq:NNT \g_dsek_reg_doc_infl_str \c_dsek_reg_doc_plural_infl_str
    {\tl_set:Nn \g_dsek_adopted_term_tl { Antagna }}

\NewDocumentCommand{\setadoptedon}{ m }{
  \tl_gset:Nn \g_dsek_adopted_on_tl {{\tl_use:N \g_dsek_adopted_term_tl}~#1 }
}

\setadoptedon{\textsf{HTMX 20xx}} % set a default value
\tl_set:Nn \g_dsek_meeting_tl {\tl_use:N \g_dsek_adopted_on_tl} % Add to header

% Set author.  Since no regulatory document has a single author, set the guild
% as the author of all regulatory documents.
\setauthor{D-sektionen~inom~TLTH}

\ExplSyntaxOff
