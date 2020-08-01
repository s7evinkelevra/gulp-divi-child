document.addEventListener("DOMContentLoaded", function () {
  
  var c = document.getElementById("c");
  var headerSection = document.getElementById('canvas-wrapper');
  var ctx = c.getContext("2d");
  var cH;
  var cW;
  var bgColor = "#e59500";
  var animations = [];
  var circles = [];

  // crappy problems 
  var firstInteraction = true

  var colorPicker = (function () {
    /* var colors = ["#990000", "#009999", "#4d0e8c"]; */
    var colors = ["#e59500", "#002642", "#840032", "#292a2e"];
    var index = 0;
    function next() {
      index = index++ < colors.length - 1 ? index : 0;
      return colors[index];
    }
    function current() {
      return colors[index]
    }
    return {
      next: next,
      current: current
    }
  })();

  function removeAnimation(animation) {
    var index = animations.indexOf(animation);
    if (index > -1) animations.splice(index, 1);
  }

  function calcPageFillRadius(x, y) {
    var l = Math.max(x - 0, cW - x);
    var h = Math.max(y - 0, cH - y);
    return Math.sqrt(Math.pow(l, 2) + Math.pow(h, 2));
  }

  function addClickListeners() {
    //document.addEventListener("touchstart", handleEvent);
    document.addEventListener("mousedown", handleEvent);
  };

  function handleEvent(e) {
    if (e.touches) {
      e.preventDefault();
      e = e.touches[0];
    }

    // disregard if out of bounds of canvas
    if (e.pageY > c.scrollHeight){ return false;}

    // require crappy solutions
    if(firstInteraction){
      anime({
        targets: '.et_pb_fullwidth_header_subhead',
        opacity: 1,
        easing: 'linear'
      });
      firstInteraction = false;
    }

    var {elemX, elemY} = globalToElementSpace(e.pageX, e.pageY, c);

    var currentColor = colorPicker.current();
    var nextColor = colorPicker.next();
    var targetR = calcPageFillRadius(elemX, elemY);
    var rippleSize = Math.min(200, (cW * .4));
    var minCoverDuration = 750;

    // set all buttons to the color of the canvas lul
    // needs some refinement (which elements/dark with white text color and light elements with white bg and colored text)
/*     const buttons = document.getElementsByTagName('button');
    for(let element of buttons){
      element.style.backgroundColor = nextColor;
      element.style.borderColor = nextColor;
      element.style.color = "#fff";
    }
 */
    var pageFill = new Circle({
      x: elemX,
      y: elemY,
      r: 0,
      fill: nextColor
    });
    var fillAnimation = anime({
      targets: pageFill,
      r: targetR,
      duration: Math.max(targetR / 2, minCoverDuration),
      easing: "easeOutQuart",
      complete: function () {
        bgColor = pageFill.fill;
        removeAnimation(fillAnimation);
      }
    });

    var ripple = new Circle({
      x: elemX,
      y: elemY,
      r: 0,
      fill: currentColor,
      stroke: {
        width: 3,
        color: currentColor
      },
      opacity: 1
    });
    var rippleAnimation = anime({
      targets: ripple,
      r: rippleSize,
      opacity: 0,
      easing: "easeOutExpo",
      duration: 900,
      complete: removeAnimation
    });

    var particles = [];
    for (var i = 0; i < 32; i++) {
      var particle = new Circle({
        x: elemX,
        y: elemY,
        fill: currentColor,
        r: anime.random(24, 48)
      })
      particles.push(particle);
    }
    var particlesAnimation = anime({
      targets: particles,
      x: function (particle) {
        return particle.x + anime.random(rippleSize, -rippleSize);
      },
      y: function (particle) {
        return particle.y + anime.random(rippleSize * 1.15, -rippleSize * 1.15);
      },
      r: 0,
      easing: "easeOutExpo",
      duration: anime.random(1000, 1300),
      complete: removeAnimation
    });
    animations.push(fillAnimation, rippleAnimation, particlesAnimation);
  }

  function extend(a, b) {
    for (var key in b) {
      if (b.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
    return a;
  }

  var Circle = function (opts) {
    extend(this, opts);
  }

  Circle.prototype.draw = function () {
    ctx.globalAlpha = this.opacity || 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    if (this.stroke) {
      ctx.strokeStyle = this.stroke.color;
      ctx.lineWidth = this.stroke.width;
      ctx.stroke();
    }
    if (this.fill) {
      ctx.fillStyle = this.fill;
      ctx.fill();
    }
    ctx.closePath();
    ctx.globalAlpha = 1;
  }

  var animate = anime({
    duration: Infinity,
    update: function () {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, cW, cH);
      animations.forEach(function (anim) {
        anim.animatables.forEach(function (animatable) {
          animatable.target.draw();
        });
      });
    }
  });

  var resizeCanvas = function () {
    cW = headerSection.offsetWidth;
    cH = headerSection.offsetHeight;
    c.width = cW;
    c.height = cH;
/*     c.width = cW * devicePixelRatio;
    c.height = cH * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio); */
  };

  (function init() {
    resizeCanvas();
    if (window.CP) {
      // CodePen's loop detection was causin' problems
      // and I have no idea why, so...
      window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 6000;
    }
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("load", resizeCanvas);

    addClickListeners();
    if (!!window.location.pathname.match(/fullcpgrid/)) {
      startFauxClicking();
    }
    handleInactiveUser();
    
    // on the presentation site, click every 5 minutes to switch the background
    if(document.location.pathname === "/prasentation/"){
      presentationClicking();
    }
  })();

  function handleInactiveUser() {
    var inactive = setTimeout(function () {
      fauxClick(cW / 2, cH / 2);
    }, 2000);

    function clearInactiveTimeout() {
      clearTimeout(inactive);
      document.removeEventListener("mousedown", clearInactiveTimeout);
    }

    document.addEventListener("mousedown", clearInactiveTimeout);
  }

  function startFauxClicking() {
    setTimeout(function () {
      fauxClick(anime.random(cW * .2, cW * .8), anime.random(cH * .2, cH * .8));
      startFauxClicking();
    }, anime.random(200, 900));
  }

  function presentationClicking() {
    setInterval(function() {
      fauxClick(cW / 2, cH / 2);
    }, 5*60*1000);
  }

  function fauxClick(x, y) {
    var fauxClick = new Event("mousedown");
    fauxClick.pageX = x;
    fauxClick.pageY = y;
    document.dispatchEvent(fauxClick);
  }

  function globalToElementSpace(x,y, element){
    var xPosition = 0;
    var yPosition = 0;

    while (element) {
      xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
      yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
      element = element.offsetParent;
    }
    return {elemX: x - xPosition, elemY: y - yPosition}
  }
});