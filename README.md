# Treeish.js

Treeish is a small library to parse nested structures in string, in other words serialized trees.

It uses a block start and matching block end definition in the form of a string or a regexp for the start token and a string, a regexp or a callback for the mathcing end block delimiter.

For exemple you can parse nested parenthetised string like "(a((b)c))" to a tree object with start delimiter "(" and end delimeter ")".

 
