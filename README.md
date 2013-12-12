# Rod's `gvpr` Extensions

This repository contains resources that augment or extend **`gvpr`**, **Graphviz's graph pattern recognizer**.

`gvpr` is an `awk`-like language for modifying or processing graphs (expressed in the [DOT language](http://www.graphviz.org/doc/info/lang.html)).

`gvpr` was written by Emden Gansner and is part of [Graphviz](http://graphviz.org/), an open source graph visualization and manipulation library created at AT&T Labs Research.

## What's `gvpr` again?

`gvpr` can process one or more DOT files, applying user-specified *actions* for every element for that meets the conditions of the corresponding (and also user-specified) *predicates*.

For example, the `gvpr` script:

    N [color=="red"] { shape = "oval" }

will change the shape of every red node to `oval`.  To use this script, we can issue a command like:


    gvpr -c "N [color==\"red\"] { shape = \"oval\" }" mygraph.gv

which will apply the given transformation to the graph defined in the file `mygraph.gv` (and print the resulting graph to stdout).  For more, you can download [a PDF rendition of the `gvpr` man page](http://www.graphviz.org/pdf/gvpr.1.pdf) or check the documentation that was bundled with your Graphviz install.

## Ok, what's in *this* repository then?

1. [**`gvpr-mode.el`**](https://github.com/rodw/gvpr-lib/blob/master/extra/gvpr-mode.el), a simple emacs mode for editing `gvpr` scripts. gvpr-mode is also [available on the Marmalade repository](http://marmalade-repo.org/packages/gvpr-mode/).  Run `M-x package-install gvpr-mode` to install it (once Marmalade has been set up [as described here](http://marmalade-repo.org/).)

2. [**`common.gvpr`**](https://github.com/rodw/gvpr-lib/blob/master/lib/common.gvpr) - A small library of utility functions for use with `gvpr`. (A suite of automated tests for these functions can be found in the [`test` directory](https://github.com/rodw/gvpr-lib/tree/master/test), and run using the top-level [`Makefile`](https://github.com/rodw/gvpr-lib/blob/master/Makefile) by invoking `make test`.)

3. [**gvprss**](https://github.com/rodw/gvpr-lib/tree/master/gvprss) - a pre-processor that implements a CSS-like stylesheet language on top of `gvpr`.  `gvprss` is implemented in JavaScript/[Node.js](http://nodejs.org/) and is [published as an npm module](https://npmjs.org/package/gvprss). You can install it by running `npm install -g gvprss`.

## So what are these for?

Well, gvpr-mode is just a quick-and-dirty syntax coloring mode I threw together because I was working on a number of `gvpr` scripts and wanted to make it easier on myself.

The gvprss and the common set of gvpr functions are an outcome of and related to a book I've been writing called [The Graphviz Cookbook](http://noumlaut.com/graphviz-cookbook).  If you're working with `gvpr` or Graphviz, please check that out (and tell your friends :) ).

## A note on licensing.

[`gvpr-mode.el`](https://raw.github.com/rodw/gvpr-lib/master/extra/gvpr-mode.el), like emacs itself, is released under the [GNU General Public License](http://www.gnu.org/licenses/) as described within the file.

Everything else is released under an [MIT License](http://opensource.org/licenses/mit-license.php), as described in [`license.txt`](https://raw.github.com/rodw/gvpr-lib/master/license.txt).
