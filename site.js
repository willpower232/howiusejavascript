// PLEASE NOTE pretty sure I can't make this code strict, sorry

// make your console.log's slightly comedic
(function() {
	// this may error horribly in IE9
	var oldLog = console.log;
	console.log = function (message) {
		if (typeof message === "string" || typeof message === "number") {
			oldLog("%c"+message, 'color:hotpink;font-family:Comic Sans MS;font-size:24px;font-weight:700');
		} else {
			oldLog(message);
		}
	};
})();

// helper based on https://github.com/edenspiekermann/a11y-dialog/blob/master/a11y-dialog.js#L39
// - alternate link https://github.com/edenspiekermann/a11y-dialog/blob/8cb7e10ff099628ba983d615f122a5a6147cb830/a11y-dialog.js#L14
// - this returns an array instead of a NodeList allowing forEach to work
var $$all = function(selector, context) {
	try {
		return Array.prototype.slice.call((context || document).querySelectorAll(selector));
	}
	catch (ex) {
		return false;
	}
};
// singular version of the above
var $$one = function(selector, context) {
	try {
		return (context || document).querySelector(selector);
	}
	catch (ex) {
		return false;
	}
};

// largely superfluous but handy for jQuery familiarity
// - els can be a NodeList
var $$each = function(els, todo) {
	if (typeof els === "string") {
		els = $$all(els);
	}

	[].forEach.call(els, function(el) {
		todo(el);
	});
};

// polyfill for Element.remove, IE10-11, forgot the source
if (!('remove' in Element.prototype)) {
	Element.prototype.remove = function() {
		if (this.parentNode) {
			this.parentNode.removeChild(this);
		}
	};
}

// on demand javascript library loader largely inspired by an earlier version of Typekits advanced loading code
var Loader = {
	load: function(dawut, dacallback) {
		var teh = document.createElement('script');

		switch (dawut) {
			case "flickity":
				// linking to a specific version for a reason I cannot remember right now, could be CSP or time related
				teh.src = 'https://npmcdn.com/flickity@2.0.3/dist/flickity.pkgd.min.js';

				// extra CSS required here, overriden by specificity in the main CSS file
				var fcss = document.createElement('link');
				fcss.rel = "stylesheet";
				fcss.href = "https://npmcdn.com/flickity@2.0.3/dist/flickity.min.css";
				document.head.appendChild(fcss);
				break;
			case "iframeresizer":
				// local file example
				teh.src = "/assets/front/iframeResizer.min.js";
				break;
			default:
				teh.src = dawut;
		}

		if (typeof dacallback === "function") {
			// gone and onreadystatechange are required for IE < 10 which doesn't do onload
			// - could omit 5 lines of code by supporting newer browers only
			var gone = false;
			teh.onload = teh.onreadystatechange = function() {
				if (gone || (this.readyState && this.readyState != 'complete' && this.readyState != 'loaded')) {
					return;
				}
				gone = true;
				dacallback();
			};
		}
		document.body.appendChild(teh);
	}
};

// it is better to separate typekit out like this as its CODE will be unique per application
Loader.load("https://use.typekit.net/CODE.js", function() {
	try { Typekit.load(); } catch (e) {}
});

// simple loading example
if ($$one('iframe')) {
	Loader.load('iframeresizer', function() {
		iFrameResize({
			checkOrigin: false
		});
	});
}

// more advanced loading example
// - all PARENTS of elements to be carouselled have this data attribute
if ($$one('[data-flickitythis]')) {

	// make sure there is more than one immediate child in a carousel before initialising
	var count = 0;
	$$all('[data-flickitythis]').forEach(function(el) {
		if (el.childNodes.length > count) {
			count = el.childNodes.length;
		}
	});

	if (count > 1) {
		Loader.load('flickity', function() {
			// cheeky double bracket usage example
			// - seems to save a line of code and work in all browsers
			if ((tehtestimonials = $$one('.testimonials .quotes[data-flickitythis]')) && tehtestimonials.querySelectorAll('.slide').length > 1) {
				var tt = new Flickity(tehtestimonials, {
					adaptiveHeight: true,
					pageDots: false,
					wrapAround:true
				});
			}

			// code for other carousels goes here
		});
	}
}

// another cheeky double bracket usage example
window.addEventListener('resize', function() {
	if ((wut = $$one('header .open'))) {
		wut.classList.remove('open');
	}
});

// set all external links to open in a new tab/window
if ($$one('a[href^=http]')) {
	$$all('a[href^=http]').forEach(function(el) {
		el.setAttribute('target', '_blank');
	});
}

// Back To Top functionality entirely based on https://gist.github.com/ricardozea/abb9f98a19f6d04a0269
// - better implemented as a button I believe
var scrollingtimeout,
	scrollToTop = function() {
		if (document.body.scrollTop !== 0 || document.documentElement.scrollTop !== 0) {
			window.scrollBy(0, -50);
			scrollingtimeout = setTimeout(function() { scrollToTop(); }, 10);
		} else {
			clearTimeout(scrollingtimeout);
		}
	};
$$one('button.backtotopbutton').addEventListener('click', scrollToTop);