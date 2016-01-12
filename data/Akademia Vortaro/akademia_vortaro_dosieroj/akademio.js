window.onload = S;

function S() {
	Retadresoj();
	if (typeof(Starto) == 'function') {
		Starto();
	}
	if (document.getElementById && document.getElementById('membronomo')) {
		document.getElementById('membronomo').focus();
	}
	if (document.getElementById && document.getElementById('ve')) {
		var ve = document.getElementById('ve');
		if (ve.value == '') {
			document.getElementById('ve').focus();
		}
		document.getElementById('serchilo').onsubmit = KontroliSerchon;
		if (document.getElementById('serchorezultotabelo')) {
			var sercholigoj = document.getElementById('serchorezultotabelo').getElementsByTagName('a');
			for (var i = 0; i < sercholigoj.length; i++) {
				var ligo = sercholigoj[i];
				if (ligo.className && ligo.href) {
					if (document.getElementById(ligo.className)) {
						ligo.href = '#' + ligo.className;
						ligo.onclick = function() { ElstarigiElementon(this.className); };
					}
				}
			}
		}
	}
}

function KomutiJesNe(th) {
	if (th && th.parentNode && th.parentNode.getElementsByTagName) {
		var iloj = th.parentNode.getElementsByTagName('input');
		var jes = iloj[0];
		var ne = iloj[1];
		if (jes && ne) {
			if (jes.checked == true) {
				ne.checked = true;
			} else {
				jes.checked = true;
			}
		}
	}
}
var celelemento;
function ElstarigiElementon(id) {
	celelemento = document.getElementById(id);
	if (celelemento) {
		var x1 = setTimeout("ElementoEk()",200);
		var x2 = setTimeout("ElementoFor()",400);
		var x3 = setTimeout("ElementoEk()",600);
		var x4 = setTimeout("ElementoFor()",800);
		var x3 = setTimeout("ElementoEk()",1000);
		var x4 = setTimeout("ElementoFor()",1500);
	}
}
function ElementoEk() {
	celelemento.style.backgroundColor = 'yellow';
	celelemento.style.color = '#000';
}
function ElementoFor() {
	celelemento.style.backgroundColor = '#fff';
	celelemento.style.color = '#000';
}

function KontroliSerchon() {
	var ve = document.getElementById('ve');
	if (ve.value == '') {
		alert('Vi devas enskribi serĉesprimon.');
		ve.focus();
		return false;
	}
	return true;
}

function Retadresoj() {
	if (window.document.getElementsByTagName) {
		var r =	window.document.getElementsByTagName("span");
		for (var i = 0; i < r.length; i++) {
			if (r[i].className == 'retadreso') {
				if (r[i].firstChild) Retadreso(r[i]);
			}
		}
	}
}

function Retadreso(r) {
	if (r.firstChild && document.createElement && r.appendChild && r.setAttribute && r.removeChild) {
		var m = r.firstChild.data.match('“([^“”]+)”[ \n\t\r]+.+e[ \n\t\r]+“([^“”]+)”');
		if (m && m[1] && m[2] && document.createElement) {
			var adreso = m[1]+"@"+m[2];
			var l = document.createElement("a");
			l.appendChild(document.createTextNode(adreso));
			l.setAttribute("href", "mailto:" + adreso);
			r.removeChild(r.firstChild);
			r.appendChild(l);
		}
	}
}

