var isToDoActive;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (isToDoActive) {
    cancel();
  } else {
    reset();
    isToDoActive = true;
    start();
  }
});

function cancel() {
  isToDoActive = false;
  reset();
  $("body *").off(".toKindle");
  $(".toKindleBtns").remove();
}
function reset() {
  $(".toKindleSelected").removeClass("toKindleSelected");
  $(".toKindleHighlights").removeClass("toKindleHighlights");
  $(".toKindleBody").remove();
  $(".toKindleSucc").remove();
}
function start() {
  var trg;
  var ignorAtt = ["href", "src"];
  var btnBody = $("<div class='toKindleBtns'></div>");
  var btnReset = $("<input type='button' value='Reset'>");
  var btnSubmit = $("<input type='button' value='Submit'>");

  btnBody.append(btnReset);
  btnBody.append(btnSubmit);
  btnBody.append(
    "<div class='toKindleLoader' style='display:none'>Sending<span>.</span><span>.</span><span>.</span></did>"
  );
  $("body").append(btnBody);

  btnReset.click(function () {
    reset();
  });

  btnSubmit.click(function () {
    $(".toKindleLoader").show(function () {
      var elms = $(".toKindleSelected");
      var body = $("<div class='toKindleBody' '>");
      $("body").append(body);
      elms.each(function () {
        body.append($(this).clone());
      });

      var allELm = body.find("*");
      if (!allELm.length) {
        alert("No element selected!");
        $(".toKindleLoader").hide();
        return;
      }
      for (var i = 0; i < allELm.length; i++) {
        var elm = $(allELm[i]);
        if (!elm.is(":visible")) {
          elm.remove();
          continue;
        }
        if (elm.is("table,thead,tbody,tr,td,th"))
          elm.replaceWith(function () {
            return $("<div />").append($(this).contents());
          });

        var attributes = $.map(elm[0].attributes, function (item) {
          return item.name;
        });
        $.each(attributes, function (i, item) {
          if (ignorAtt.indexOf(item) === -1) {
            elm.removeAttr(item);
          }
        });
      }
      var images = body.find("img");
      body.find('img[src$=".gif"]').remove();
      var promises = [];
      images.each(function () {
        var def = new $.Deferred();
        var img = $(this);
        var link = img.attr("src");
        toDataURL(link, function (dataUrl) {
          img.attr("src", dataUrl);
          setTimeout(function () {
            def.resolve(dataUrl);
          }, 200);
        });
        promises.push(def);
      });
      var title = $(document).find("title").text();
      $.when.apply(undefined, promises).then(function () {
        var str =
          "<html><head><meta http-equiv='Content-Type' content='text/html; charset=utf-8' /></head><body><h3>" +
          title +
          "</h3>" +
          body.html() +
          "</body></html>";
        sent({
          link: window.location.href,
          html: str,
          reSend: false,
          title: title,
        });
      });
    });
  });

  $("body *").on("mouseover.toKindle", function (e) {
    trg = $(e.target);
    if (trg.closest(".toKindleBtns").length) return;
    trg.addClass("toKindleHighlights");
  });
  $("body *").mouseout("mouseout.toKindle", function (e) {
    if (!trg) return;
    trg.removeClass("toKindleHighlights");
    trg = null;
  });
  $("body").click(function (e) {
    if (
      !trg ||
      trg.parent().closest(".toKindleSelected").length ||
      trg.closest(".toKindleBtns").length
    )
      return;
    trg.find("*").removeClass("toKindleSelected");

    if (trg.is(".toKindleSelected")) trg.removeClass("toKindleSelected");
    else trg.addClass("toKindleSelected");
  });
}
function toDataURL(url, callback) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.blob();
    })
    .then((blob) => {
      var reader = new FileReader();
      reader.onload = function () {
        callback(this.result);
      };
      reader.readAsDataURL(blob);
    })
    .catch((error) => {
      callback("");
      console.error(
        "There has been a problem with your fetch operation:",
        url,
        error
      );
    });
}
function showLoader() {
  $(".toKindleBtns").append(
    "<div class='toKindleLoader' style='display:none'>Sending...</did>"
  );
  //var target = document.getElementById('spin-area');
  //var spinner = new Spinner().spin(target);
}
function sent(info) {
  chrome.runtime.sendMessage(info, function (response) {
    $(".toKindleLoader").hide();
    if (response == 200) {
      cancel();
      var succ = $("<div class='toKindleSucc'>Sent Successfully.</div>");
      $("body").append(succ);
      succ.click(function () {
        succ.remove();
      });
    } else if (response === 208) {
      if (
        confirm(
          "Site has been sent to kindle before, would you like to send it again?"
        )
      ) {
        $(".toKindleLoader").show(function () {
          info.reSend = true;
          sent(info);
        });
      } else {
        cancel();
      }
    } else {
      console.error(response);
      $(".toKindleBody").remove();
      alert("An error has occurred, for more info look at the console.");
    }
  });
}
