-- Build configuration for dsekdocs

module  = "dsekdocs"
version = "0.1.1"
pkgdate = "2023/02/05"
gittag  = "v"..version

uploadconfig = {
  version	= version,
  author	= "D-sektionen inom TLTH",
  license	= "mit",
  summary	= "Document classes and so forth for D-sektionen inom TLTH",
  ctanPath = "/macros/latex/contrib/dsekdocs",
  repository  = "https://github.com/Dsek-LTH/dsekdocs",
  bugtracker = "https://github.com/Dsek-LTH/dsekdocs/issues",
  description = [[
     This is a package and a few document classes for the documents of
     D-sektionen inom TLTH, a student guild at Lunds Tekniska Högskola.
  ]],
  topic = {"class"}
}

-- Files
sourcefiles  = {"*.sty", "*.cls", "images/"}
typesetfiles = {"*.tex"}
installfiles = {"*.sty", "*.cls", "images/"}
tagfiles     = {"*.sty", "*.cls"}

textfiles = {"ctan/*.md", "*.txt", "LICENSE"}

-- Testing

testfiledir = "./tests"

checkengines = {"xetex", "luatex"}
checkruns = 2					-- allow for an extra run when needed

-- Typesetting documentation

typesetexe = "xelatex"

-- Announcements
ancmts = {}

ancmts["0.1.0"] = ""
ancmts["0.1.1"] = "Some tidying up."

uploadconfig.announcement = ancmts[version]


-- Check tag dates
today = os.date("%Y/%m/%d")
if pkgdate ~= today then
  print("Package date is not today:"..
        "\nPkg date: "..pkgdate..
        "\nToday:    "..today)
end
