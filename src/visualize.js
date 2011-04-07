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
  
  $("#interpret").click(function () {
    var input = $("#edit").val();
    var parser = Parser.ofString(input);
    var visual = null;
    var result = "";
    try {
      while (true) {
        visual = { root: null, slides: [] };
        var expr = Parser.parse(parser);
        if (!expr) {
          break;
        }
        visual.root = expr;
        var type = Inferer.infer(typeCtxt, typeEnv, variants, visual, expr);
        var value = Eva.eval(valueEnv, expr);
        result += "- : " + type + " = " + value + "\n";
        setSlide(visual.slides);
      }
    } catch (e) {
      if (e instanceof IbisError) {
        result += "ERROR: " + e.message + "\n";
        if (visual.slides.length != 0) {
          setSlide(visual.slides);
        }
      } else {
        throw e;
      }
    } finally {
      $("#result").val(result);
    }
  });
  
  var fizzbuzz = '\
let rec fizzbuzz = fun from -> fun to ->\n\
  if from > to then ""\n\
  else if from mod 15 = 0 then "FizzBuzz " ^ fizzbuzz (from + 1) to\n\
  else if from mod 3 = 0 then "Fizz " ^ fizzbuzz (from + 1) to\n\
  else if from mod 5 = 0 then "Buzz " ^ fizzbuzz (from + 1) to\n\
  else show from ^ " " ^ fizzbuzz (from + 1) to\n\
;;\n\
\n\
fizzbuzz 1 100;;\n'
  $("#fizzbuzz").click(function () {
    $("#edit").val(fizzbuzz);
  });
  
  $("#clear").click(function () {
    $("#edit").val("");
  });
  
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
  
  function setSlide(slides) {
    slideArray = slides;
    currentSlide = slides.length - 1;
    updateScreen();
  }
  
  function updateScreen() {
    $("#first").attr("disabled", false);
    $("#prev").attr("disabled", false);
    $("#next").attr("disabled", false);
    $("#last").attr("disabled", false);
    if (currentSlide == 0) {
      $("#first").attr("disabled", true);
      $("#prev").attr("disabled", true);
    }
    if (currentSlide == slideArray.length - 1) {
      $("#next").attr("disabled", true);
      $("#last").attr("disabled", true);
    }
    $("#screen").val(slideArray[currentSlide]);
  }
});
