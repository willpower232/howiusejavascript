// PLEASE NOTE pretty sure I can't make this code strict, sorry

// make your console.log's slightly comedic
(function() {
	// this may error horribly in IE9
	var oldLog = console.log;
	console.log = function(message) {
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
// - means you don't need to write querySelector at all any more, saving a few bytes
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
				teh.src = "https://npmcdn.com/flickity@2.0.5/dist/flickity.pkgd.min.js";

				// extra CSS required here, overriden by specificity in the main CSS file
				var fcss = document.createElement('link');
				fcss.rel = "stylesheet";
				fcss.href = "https://npmcdn.com/flickity@2.0.5/dist/flickity.min.css";
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
			if ((tehtestimonials = $$one('.testimonials .quotes[data-flickitythis]')) && $$all('.slide', tehtestimonials).length > 1) {
				// adding flickity instance to variable not necessary
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
// AND auto expanding textarea, source https://justmarkup.com/log/2016/10/enhancing-a-comment-form/
if ((tehtextarea = $$one('.contactform textarea'))) {
	tehtextarea.addEventListener('keydown', function() {
		var el = this;
		setTimeout(function() {
			el.style.cssText = "height:auto;";
			el.style.cssText = "height:" + el.scrollHeight + "px";
		}, 0);
	});
}

if ((tehmap = $$one('.themap .wrapper'))) {
	//google maps has a more explicit loading callback
	Loader.load('https://maps.googleapis.com/maps/api/js?key=YOURAPIKEY&callback=mapinit');
	var mapinit = function() {

		//list of points to describe the bounding box for the map
		//- first point will have a big pin on it
		var points = [
			{lat: 53.2286607, lng: -0.5504175}, //UoL
			{lat: 53.2343636, lng: -0.5386587}  //Castle Square, Lincoln
		];

		//create the map
		//- scrollwheel is annoying unless full screen
		var map = new google.maps.Map(tehmap, {
			center: points[0], //initial center overridden by the bounds
			scrollwheel: false,
			zoom: 8
		});

		//place the pin on your main point
		new google.maps.Marker({
			position: points[0],
			map: map,
			icon: '/assets/front/img/bigpoint.svg'
		});

		//create the bounds to focus the map
		var bounds = new google.maps.LatLngBounds();
		points.forEach(function(p) {
			bounds.extend(p);
		});

		//keep the map focussed where you want it to be
		var setBounds = function() {
			map.fitBounds(bounds);
		};
		window.addEventListener('resize', setBounds);
		setBounds();
	};
}

// intercept all requests for the forms controller
if ($$all('form[action="/forms/go"]').length) {
	$$all('form[action="/forms/go"]').forEach(function(form) {

		// optimistically remove the required markers on focus
		form.addEventListener('focus', function(ev) {
			if (ev.target.tagName == "SELECT") {
				ev.target.parentNode.classList.remove('required');
			} else {
				ev.target.classList.remove('required');
			}
		}, true);

		form.addEventListener('submit', function(ev) {
			if (typeof FormData !== "undefined") {
				ev.preventDefault();
				var tehform = ev.target,
					tehdata = new FormData(tehform),
					request = new XMLHttpRequest(),
					message = $$one('p', tehform); // element to write messages in

				// if you are adding additional information to formdata (or don't have a form at all)
				// tehdata.append(field, value);

				// make sure there are no outstanding required markers
				$$all('.required', tehform).forEach(function(el) {
					el.classList.remove('required');
				});

				request.open('POST', "/forms/go");
				request.setRequestHeader("X-Requested-With", "XMLHttpRequest"); // clearly identify ajax to the server code
				request.onreadystatechange = function() {
					if (this.readyState === 4) {
						if (this.status >= 200 && this.status < 400) {
							var output = this.responseText,
								okay = false;
							try {
								output = JSON.parse(output);
								okay = true;
							}
							catch (e) {
								// output is HTML or plain text
							}

							// we want JSON ideally
							if (okay) {
								if (output.worked === 0) {
									message.innerHTML = "Please check the highlighted fields below.";
									output.errors.forEach(function(name) {
										// replaced select element needs required marker on the container
										if (name == "branch") {
											$$one('[name='+name+']', tehform).parentNode.classList.add('required');
										} else {
											$$one('[name='+name+']', tehform).classList.add('required');
										}
									});
								} else {
									message.innerHTML = output.html;
									// empty the form so only the thank you message is visible
									$$all('.selectwrapper,label,input,textarea', tehform).forEach(function(el) {
										el.parentNode.removeChild(el);
									});
								}
							} else {
								// debug
								alert("Unfortunately we did not receive your message. Response: " + output);
							}

						} else {
							// debug
							alert("Unfortunately we did not receive your message. Code: " + this.status);
						}
					}
				};
				request.send(tehdata);
			} else {
				// carry on as usual as formdata doesn't exist something along the lines of
				// request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				// and the values should be URL encoded, encodeURIComponent() would likely be handy
				// request.send('field=value&field1=value1&field2=value2');
			}
		});
	});
}

// keep the below at the bottom of the file to de prioritise their use

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