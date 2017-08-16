$(function() {
  "use strict";
  jQuery.fn.extend({
    phase: function(fxn) {
      var pname = fxn.name;
      $('.phase')
        .removeClass('selected')
        .filter('.' + pname)
        .addClass('selected');
      try {
        this.each(fxn);
      } catch (E) {
        console && console.error && console.error(pname, E);
        return $();
      }
      
      return this;
    },
    shift: function() {
      return $(Array.prototype.shift.apply(this));
    },
    unshift: function(s) {
      Array.prototype.unshift.apply(this, $.makeArray($(s)));
    }
  });
  
  $('main')
    .phase(lex)
    .phase(parse)
    .phase(emit);
});












var INDENT = '    ';
var IMPORT =  INDENT + 'extern printf  ; from libc\n\n' +
              '%macro puts 1\n\n' + 
              INDENT + 'push dword %1\n' +
              INDENT + 'push dword pcts\n' +
              INDENT + 'call printf\n' +
              INDENT + 'add esp, 8\n' +
              '%endmacro\n\n' +
              '%macro puti 1\n\n' +
              INDENT + 'push dword %1\n' +
              INDENT + 'push dword pctd\n' +
              INDENT + 'call printf\n' +
              INDENT + 'add esp, 8\n' +
              '%endmacro\n\n';
var MAIN =  INDENT + 'SECTION .text\n\n' +
            INDENT + 'global main\n' +
            'main:\n';
var DATA =  INDENT + 'SECTION .data\n\n' +
            'pctd: db "%d",10,0 ; int fmt\n' + 
            'pcts: db "%s",10,0 ; str fmt\n';
var BSS = INDENT + 'SECTION .bss\n\n';
var EXIT =  INDENT + 'mov eax, 0 ; exit code=0\n' + 
            INDENT + 'ret ; return to OS\n';