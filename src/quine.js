// @ts-nocheck
var text =
  "<!DOCTYPE html>" +
  document.getElementsByTagName("html")[0].innerHTML +
  "</html>";
text = text
  .replace(/\s*(\n\s*)+/gi, "")
  .replace(/\s+(?= )/g, "")
  .split("");

// 计算出单个字符的宽高
var span = document.createElement("span");
span.innerHTML = ".";
var canvas = document.getElementById("canvas");
canvas.appendChild(span);
var rect = span.getBoundingClientRect();
var span_width = rect.width,
  span_height = rect.height;
canvas.removeChild(span);

var image = new Image();
image.src =
  "https://static.lurenjia.in/static/2020/11/quine-image-generator/image.png";
image.crossOrigin = "";
image.onload = function () {
  var cnvs = document.createElement("canvas");
  cnvs.width = image.width;
  cnvs.height = image.height;

  document.body.appendChild(cnvs);

  var ctx = cnvs.getContext("2d");
  ctx.drawImage(image, 0, 0);
  // 每个字所占像素
  var per_box = Math.floor((cnvs.width * cnvs.height) / text.length),
    // 字符宽高比
    ratio = span_height / span_width,
    // 横向字符数
    x_size = Math.sqrt(per_box / ratio),
    // 纵向字符数
    y_size = per_box / x_size;

  try {
    var imageData = ctx.getImageData(0, 0, cnvs.width, cnvs.height);
    // 根据图片数据配置文字样式
    getPoints(imageData);
    document.getElementById("download").style.display = "block";
  } catch (ex) {
    document.getElementById("unsupported").style.display = "block";
    console.error(ex);
  }

  document.body.removeChild(cnvs);

  function getPoints(imageData) {
    var i = 0,
      lastText = "",
      title = false;

    var target_rows = Math.ceil((cnvs.height - 2) / y_size) + 1,
      target_cols = Math.ceil((cnvs.width - 2) / x_size) + 1,
      ypad = span_height;

    var qcanvas = document.createElement("canvas");
    qcanvas.width = span_width * target_cols;
    qcanvas.height = span_height * target_rows;
    document.getElementById("canvas").style.width =
      span_width * target_cols + "px";
    document.body.appendChild(qcanvas);
    var c = qcanvas.getContext("2d");

    c.fillStyle = "#000";
    c.fillRect(0, 0, qcanvas.width, qcanvas.height);

    for (var y = 0; y < cnvs.height - 1; y += y_size) {
      var total = 0;
      var row = document.createElement("span");
      row.style.display = "block";
      row.style.height = span_height;

      var ypos = (y * span_height) / y_size;

      for (var x = 0; x < cnvs.width - 1; x += x_size) {
        var color = getColor(imageData, x, y),
          character = text[i] !== undefined ? text[i] : "";
        if (character == "<") title = false;
        if (title) color = "#fff";

        i += 1;
        total += 1;

        var char = document.createElement("span");
        char.style.color = color;
        char.style.font = title ? "bold 15px Courier" : "";
        char.innerHTML = character;

        row.appendChild(char);

        var font_style = title ? "bold" : "normal";
        var font_size = "15px";

        // 避免这段代码本身被识别为高亮，所以绕了个弯
        lastText = (lastText + character).substr(-13);
        if (
          lastText.indexOf("<title>") !== -1 &&
          lastText.indexOf("<head>") !== -1
        )
          title = true;

        c.textBaseline = "bottom";
        c.font = font_style + " " + font_size + " " + "Courier";
        c.fillStyle = color;
        var xpos = (x * span_width) / x_size;
        c.fillText(character, xpos, ypos + ypad);
      }
      document.getElementById("canvas").appendChild(row);
    }

    document.body.removeChild(qcanvas);
  }
};

// 获取平均颜色
function getColor(imageData, x, y) {
  var x = Math.round(x),
    y = Math.round(y),
    index = (y * imageData.width + x) * 4,
    red = imageData.data[index],
    green = imageData.data[index + 1],
    blue = imageData.data[index + 2],
    alpha = imageData.data[index + 3];

  /* Add border around the pixel */
  for (var x2 = -1; x2 <= 1; x2++) {
    for (var y2 = -1; y2 <= 1; y2++) {
      if (!(x2 == 0 && y2 == 0)) {
        var index_new = ((y + y2) * imageData.width + x + x2) * 4;
        imageData.data[index_new] = 255;
        imageData.data[index_new + 1] = 255;
        imageData.data[index_new + 2] = 255;
        imageData.data[index_new + 3] = alpha;
      }
    }
  }
  return "rgb(" + red + "," + green + "," + blue + ")";
}

document.getElementById("save").onclick = function (ev) {
  ev.preventDefault();

  var e = document.createElement("a");
  e.download = "index.html";
  e.style.display = "none";
  var blob = new Blob([text.join("")]);
  e.href = URL.createObjectURL(blob);
  document.body.appendChild(e);
  e.click();
  document.body.removeChild(e);
};

var charCode = document.getElementsByClassName("charcode");
for (var i = 0; i < charCode.length; i++) {
  charCode[i].innerHTML = String.fromCharCode(charCode[i].innerHTML);
}

document.getElementById("unsupported").innerHTML =
  "Your browser is unsupported, please use the newest version of Firefox/Chrome!";
