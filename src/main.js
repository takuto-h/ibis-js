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
  var slideArray = [""];
  var currentSlide = 0;
  
  $("#term").terminal(function (command, term) {
    var parser = Parser.ofString(command);
    var visual = null;
    try {
      while (true) {
        var expr = Parser.parse(parser);
        if (!expr) {
          break;
        }
        visual = { root: expr, slides: [] };
        var type = Inferer.infer(typeCtxt, typeEnv, variants, visual, expr);
        var value = Eva.eval(valueEnv, expr);
        term.echo("- : " + type + " = " + value);
        setSlide(visual.slides);
      }
    } catch (e) {
      if (e instanceof IbisError) {
        term.error("ERROR: " + e.message);
        setSlide(visual.slides);
      } else {
        throw e;
      }
    }
  }, {
    greetings: "Ibis Interpreter",
    prompt: ">",
    name: "ibis",
    width: 500,
    height: 250,
    exit: false
  });
  
  function setSlide(slides) {
    slideArray = slides;
    currentSlide = 0;
    updateScreen();
  }
  
  $("#first").click(function () {
    currentSlide = 0;
    updateScreen();
  });
  
  $("#prev").click(function () {
    if (currentSlide != 0) {
      currentSlide--;
      updateScreen();
    }
  });
  
  $("#next").click(function () {
    if (currentSlide != slideArray.length - 1) {
      currentSlide++;
      updateScreen();
    }
  });
  
  $("#last").click(function () {
    currentSlide = slideArray.length - 1
    updateScreen();
  });
  
  
  function updateScreen() {
    $("#screen").val(slideArray[currentSlide]);
  }
  
  $("#term").css("float", "left");
  $("#slide").css("width", "500px");
  $("#slide").css("float", "left");
});
