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
  var slideArray;
  var currentExpression;
  var currentInferenceStep;
  
  $("#interpret").click(function () {
    var input = $("#edit").val();
    var parser = Parser.ofString(input);
    var visual = null;
    var result = "";
    initSlide();
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
  
  function initSlide() {
    slideArray = [];
    currentExpression = -1;
    currentInferenceStep = -1;
    $("#expression > *").attr("disabled", true);
    $("#inference > *").attr("disabled", true);
    $("#screen").val("");
  }
  
  function setSlide(slides) {
    slideArray.push(slides);
    currentExpression++;
    currentInferenceStep = slides.length - 1;
    updateScreen();
  }
  
  function updateScreen() {
    $("#expression > *").attr("disabled", false);
    $("#inference > *").attr("disabled", false);
    if (currentExpression <= 0) {
      $("#expression .first").attr("disabled", true);
      $("#expression .prev").attr("disabled", true);
    }
    if (currentExpression >= slideArray.length - 1) {
      $("#expression .next").attr("disabled", true);
      $("#expression .last").attr("disabled", true);
    }
    if (currentInferenceStep <= 0) {
      $("#inference .first").attr("disabled", true);
      $("#inference .prev").attr("disabled", true);
    }
    if (currentInferenceStep >= slideArray[currentExpression].length - 1) {
      $("#inference .next").attr("disabled", true);
      $("#inference .last").attr("disabled", true);
    }
    var scrollTop = $("#screen").scrollTop();
    $("#screen").val(slideArray[currentExpression][currentInferenceStep]);
    $("#screen").scrollTop(scrollTop);
  }
  
  $("#expression .first").click(function () {
    currentExpression = 0;
    currentInferenceStep = slideArray[currentExpression].length - 1;
    updateScreen();
  });
  
  $("#expression .prev").click(function () {
    if (currentExpression != 0) {
      currentExpression--;
      currentInferenceStep = slideArray[currentExpression].length - 1;
      updateScreen();
    }
  });
  
  $("#expression .next").click(function () {
    if (currentExpression != slideArray.length - 1) {
      currentExpression++;
      currentInferenceStep = slideArray[currentExpression].length - 1;
      updateScreen();
    }
  });
  
  $("#expression .last").click(function () {
    currentExpression = slideArray.length - 1
    currentInferenceStep = slideArray[currentExpression].length - 1;
    updateScreen();
  });
  
  $("#inference .first").click(function () {
    currentInferenceStep = 0;
    updateScreen();
  });
  
  $("#inference .prev").click(function () {
    if (currentInferenceStep != 0) {
      currentInferenceStep--;
      updateScreen();
    }
  });
  
  $("#inference .next").click(function () {
    if (currentInferenceStep != slideArray[currentExpression].length - 1) {
      currentInferenceStep++;
      updateScreen();
    }
  });
  
  $("#inference .last").click(function () {
    currentInferenceStep = slideArray[currentExpression].length - 1
    updateScreen();
  });
  
  var factorial = '\
let rec factorial = fun n ->\n\
  if n = 0 then\n\
    1\n\
  else\n\
    n * factorial (n - 1)\n\
;;\n'
  $("#factorial").click(function () {
    $("#edit").val(factorial);
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
  
  var peano = '\
type nat = Zero of unit | Succ of nat;;\n\
let zero = Zero ();;\n\
let one = Succ zero;;\n\
let two = Succ one;;\n\
let rec add = fun m -> fun n -> case m of\n\
  Zero -> fun _ -> n\n\
| Succ -> fun k -> Succ (add k n)\n\
;;\n\
let rec int_of_nat = fun n -> case n of\n\
  Zero -> fun _ -> 0\n\
| Succ -> fun k -> 1 + int_of_nat k\n\
;;\n\
int_of_nat (add one two);;\n'
  $("#peano").click(function () {
    $("#edit").val(peano);
  });
  
  $("#clear").click(function () {
    $("#edit").val("");
  });
});
