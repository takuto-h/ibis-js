jQuery(document).ready(function ($) {
  var Env = Ibis.Env;
  var Parser = Ibis.Parser;
  var Inferer = Ibis.Inferer;
  var Eva = Ibis.Eva;
  var Type = Ibis.Type;
  var Value = Ibis.Value;
  var Compat = Ibis.Compat;
  var Default = Ibis.Default;
  var IbisError = Ibis.IbisError;
  
  var env = Default.createEnv();
  var valueEnv = env.valueEnv;
  var typeCtxt = env.typeCtxt;
  var typeEnv = env.typeEnv;
  var variants = Env.createGlobal({});
  
  $("#term").terminal(function (command, term) {
    var parser = Parser.ofString(command);
    try {
      while (true) {
        var expr = Parser.parse(parser);
        if (!expr) {
          break;
        }
        var visual = { root: expr, slides: [] };
        var type = Inferer.infer(typeCtxt, typeEnv, variants, visual, expr);
        var value = Eva.eval(valueEnv, expr);
        term.echo("- : " + type + " = " + value);
      }
    } catch (e) {
      if (e instanceof IbisError) {
        term.error("ERROR: " + e.message);
      } else {
        throw e;
      }
    }
  }, {
    greetings: "Ibis Interpreter",
    prompt: ">",
    name: "ibis",
    exit: false
  });
});
