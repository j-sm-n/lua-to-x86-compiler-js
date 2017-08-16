//
// Phase 2: Parsing
// 
// The next step is to parse. So we take our stream of tokens from lexing, and use that to build up an
// abstract syntax tree. We'll be using our browser's DOM tree to visualize that syntax tree by inspecting
// the browser's output. The job of the `parse` function is to apply syntax rules to each of the tokens and
// where it matches we add that to our syntax tree, otherwise we identify a syntax error. If you've used a
// C++ compiler before, for example, then you will have come up against syntax errors whenever you mistyped
// something.
//
// `parse()` starts much like `lex()`, by creating an object `root`. We then use a technique known
// as [recursive-descent](https://en.wikipedia.org/wiki/Recursive_descent_parser) to parse our token stream.
// See Hursh Jain's [guide to parsing](http://www.mollypages.org/page/grammar/index.mp) for more background info
// on parsing techniques. This takes place in the function `parseBlock()`, which descends into the syntax tree
// as we're building it. It builds up a new object within `body` tags, that adds `div`s with the class 'ast'
// and the class the lexer passed in, using the function `ast()`.
//
// When we're in each block of code we use `peekToken()` to get the token type we identified in the lexing phase.
// Armed with that, we loop through each block and depending on the token type identified by `testKeyword()`
// we call a different parse function.
//
// We have different parse functions for whether it's an identifier, a `for` loop or an `if` statement, but if
// it's an `end`, `elseif` or `else`, or we're at the end of the file (EOF), then we just `return`. If it's
// none of those, then we print an error message with `err()`.
// 
// The parse functions, `parseFunctionCall()`, `parseExpr()`, `parseFor()`, `parseElseIf()` and `parseIf()`,
// build up our syntax tree by adding nodes. They all essentially do the same thing - they use `nextToken()`
// and `expect()` to go through the tokens and put expected tokens in to the output, otherwise they show an
// error message like 'unexpected token' or 'unexpected end of file'.
//
// If you run the program now by clicking '[Show](https://shag-legs.hyperdev.space/)', and inspect the output
// using Firefox's 3D render view, then you can see the syntax tree expressed by the browser's DOM tree, with
// different levels, or nodes, and their children, which form the different blocks of our program.
//
// The one limitation with this is that we're parsing with right-associative precedence, which doesn't make sense
// for all cases in Lua. But it at least conveys what parsing does and it works for our example program.
//
// Now take a look in emit.js.
//
function parse() {
  "use strict";
  
  var $root = $(this);
  var $tokens = $root.children().clone();
  $root.children().remove();
  
  parseBlock($root);
  
  function parseBlock($this){
    $this = ast($this, 'body');
    while (true) {
      var $tok = peekToken();
      if ($tok.length === 0) {
        return; // EOF
      } else if(testKeyword($tok, 'for')) {
        parseFor($this);
      } else if(testKeyword($tok, 'if')) {
          parseIf($this);
      } else if(testKeyword($tok, 'end', 'elseif', 'else')) {
          return; // end of block
      } else if($tok.hasClass('ident')) {
        parseFunctionCall($this);
      } else{
          err($this, "ERROR: Unknown token - ", $tok);
      }
    }
  }
  
  function ast($this, className) {
    var $stmt = $("<div>").addClass('ast').addClass(className);
    $this.append($stmt);
    return $stmt;
  }
  
  function peekToken() {
    return $tokens.filter('.token').first();
  }
  
  function testKeyword() {
    var rg = $.makeArray(arguments);
    var $this = rg.shift();
    if(!$this.hasClass('keyword')) {
      return false;
    }
    return rg.indexOf($this.text()) !== -1;
  }
  
  function err($this, text, $tok) {
    $this.append($('<span>').addClass('parseError').text(text).append($tok));
    throw [text, $tok];
  }
  
  function parseFunctionCall($this) {
    $this = ast($this, 'function');
    parseLhs($this); // TODO: arbitrary expressions [[ HERE ]](...)
    expect($this, 'op', '(');
    parseExpr($this); // TODO: commas in function calls
    expect($this, 'op', ')');
  }
  
  function parseLhs($this){
    $this = ast($this, 'lhs');
    var $tok = nextToken($this);
    if(!$tok.hasClass('ident')) {
      err($this, 'Expected identifier, found ', $tok);
    }
    $this.append($tok);
  }
  
  function nextToken($this) {
    while (true) {
      var $el = $tokens.shift();
      if ($el.length === 0) {
        err($this, 'Unexpected end of file!');
      } else if (!$el.hasClass('token')) {
        $this.append($el);
      } else {
        return $el;
      }
    }
  }
  
  function expect($this, expectedClass, expectedText) {
    var $tok = nextToken($this);
    if(!$tok.hasClass(expectedClass)) {
      err($this, 'Unexpected token - expected ' + expectedClass + ' ' + expectedText + ', found ', $tok);
    } else if ($tok.text() !== expectedText) {
      err($this, 'Unexpected value - expected ' + expectedText + ', found ', $tok);
    } else {
      $this.append($tok);
    }
  }
  
  function parseExpr($this) {
    // BUG: this parses with right-associative precedence
    $this = ast($this, 'expr');
    var $tok = nextToken($this);
    if ($tok.hasClass('op') && $tok.text() == '(') {
      parseParen($this, $tok);
    } else {
      $this.append(ast($this, 'expr').append($tok));
    }
    tryParseOp($this);
  }
  
  function parseParen($this, $tok) {
    $this = ast($this, 'expr');
    $this.append($tok);
    parseExpr($this);
    expect($this, 'op', ')');
  }
  
  function tryParseOp($this) {
    var $tok = peekToken();
    if ($tok === undefined) {
      return;
    } else if(!$tok.hasClass('op')) {
      // not an op
      return;
    } else if(['(', ')', ','].indexOf($tok.text()) !== -1){
      // not an op; '(' should have been parseParen
      return;
    }
      
    var $prev = $this.children().last();
    $prev.remove();
    var $next = ast($this, 'expr');
    $next.append($prev);
    $next.append(nextToken($next));
    parseExpr($next);
  }
  
  function parseFor($this) {
     $this = ast($this, 'for');
     expect($this, 'keyword', 'for');
     parseLhs($this);
     expect($this, 'op', '=');
     parseExpr($this);
     expect($this, 'op', ',');
     parseExpr($this);
     expect($this, 'op', ',');
     parseExpr($this);
     expect($this, 'keyword', 'do');
     parseBlock($this);
     expect($this, 'keyword', 'end');
  }
  
  function parseIf($this) {
    $this = ast($this, 'if');
    expect($this, 'keyword', 'if');
    parseExpr($this);
    expect($this, 'keyword', 'then');
    parseBlock($this);
    
    while(testKeyword(peekToken(), 'elseif')) {
      parseElseIf($this);
    }
    if(testKeyword(peekToken(), 'else')) {
      var $else = ast($this, 'else');
      expect($else, 'keyword', 'else');
      parseBlock($else);
    }
    expect($this, 'keyword', 'end');
  }
  
  function parseElseIf($this) {
    $this = ast($this, 'elseif');
    expect($this, 'keyword', 'elseif');
    parseExpr($this);
    expect($this, 'keyword', 'then');
    parseBlock($this);
  }
}