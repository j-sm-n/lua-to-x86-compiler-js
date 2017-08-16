//
// Background:
// A compiler is a program that takes text, goes through a few phases to figure out what it means, and then represents
// that text in a different way. Typically that different way will be an executable program. In this case, we're going
// to emit Assembly for the x86 processor. Our test Lua program, which we’re going to compile to prove our compiler works,
// is a variant of Fizz Buzz.
//
// So, the program counts down from 10 to 1, printing 'Bazz' if the number is 10 or 5, 'Fooz' if it's 9, 6 or 3, but
// otherwise it prints the number and ends by printing 'Blastoff!' Compilers typically include type-checking, optimizing
// and other stages, but we're omitting them to keep this focused. However, all the main compiler components are
// there - Lexing, Parsing, and Emitting.
//
// Lexing takes text and turns it into tokens. Parsing takes a stream of tokens and converts it into a syntax tree, where
// a tree is a node that may have children. In our case, we're going to have a `print` node, a `for` node and a `print` node.
// Within the `for` node will be other branches of nodes, and by the end, we'll have a tree of nodes that represents the
// entire 'Fooz Bazz' program. Finally, the Emit phase takes the output of the Parse phase and it generates the output.
// So Emit has to know what the syntax tree means and what that should become in the target language.

// Let's get started!

//
// Phase 1: Lexing
// 
// We start by looking at the `lex()` function in lex.js. All this does is, through a linear process,
// it breaks up the text we have and it identifies known parts of it as different types of tokens.
// These tokens are used later when parsing. So, `lex()` starts by defining object `text`, which we
// get the text from and clear it in the browser. 
//
// The outcome of `lex()` is our test program is now split up into its component parts. Now look at `parse.js`.
//
function lex() {
  "use strict";
  
  var $this = $(this);
  var text = $this.text();
  $this.text('').children().remove();
  
  var $whitespace = $('<span>').addClass('ignored');
  
//
// We loop through `text` and break up the contents into tokens using RegEx, replacing the specific syntax
// elements that we can identify. We first look for text between quote marks that we replace with 'string token'.
// We also look for code comments, numbers, operations, known conditional keywords, and identifiers. The `replace`
// function then takes the text that it finds and puts it into a `span`. We also need to handle any whitespace that
// may exist, which we do with `appendWhitespace`.
//
// 
// All that does is put it in a `span` too, but with a class that styles it when rendered in the browser. So that
// we can understand what kind of whitespace it is, we use the function `selector` to append another class, such
// as ‘line-feed’ or ‘carriage-return’ so the types are identifiable when we render them.
//
  while (text !== '') {
    if (
      replace(/^"[^"]*"/, 'string token') ||
      replace(/^--[^\r\n]*/, 'comment') ||
      replace(/^-?\d+/, 'number token')||
      replace(/^(==|<=|>=|!=|=|\(|\)|,|and|or)/, 'op token')||
      replace(/^(for|if|elseif|else|end|do|then)\b/, 'keyword token') ||
      replace(/^[a-z][a-z0-9_]*\b/, 'ident token')
      ) {
        // `replace` has side effects 
    } else {
      var ch = text.charAt(0);
      $whitespace.append($('<span>').addClass(selector(ch)).text(ch));
      text = text.substr(1);
    }
  }
  appendWhitespace();
 
  function appendWhitespace(){
    if($whitespace.children().length > 0) {
      $this.append($whitespace);
      $whitespace = $('<span>').addClass('ignored');
    }
  }
  
  function replace(re, rclass) {
    if(!re.test(text)) { return false; }
    appendWhitespace();
    var sContent = re.exec(text)[0];
    text = text.substr(sContent.length);
    $this.append($('<span>').addClass(rclass).text(sContent));
    return true;
  }
  
  function selector(ch) {
    return ({'\r': 'carriage-return', '\n': 'line-feed', '\t': 'tab', ' ': 'space'})[ch] || 'other';
  }
}