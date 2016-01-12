// Enŝaltu tion en la publika TTT-ejo,
// nur kiam ĉio estos perfekta pri la nova Kometa serĉometodo 
//$( AKStarto );

var serchorezultotbody;
var t1;
function AKStarto() {
	var forms = $("#serchilo");
	if (forms && forms[0]) {
		var form = forms[0];
		$(form).attr("target", "iframe");
		$(form).submit(Serchi);
		$("#inputajakso").val(1);
	}
	MalplenigiIframe();
}

function MalplenigiIframe() {
	if (window.frames && window.frames["iframe"]) {
		window.frames["iframe"].window.location = "about:blank";
	}
}

function Serchi() {
	$("#serchorezulto").html('<table><tbody></tbody></table>');
	var date = new Date();
	t1 = date.valueOf();
	$("#inputhazardo").val(date.valueOf());
	serchorezultotbody = $("#serchorezulto tbody")[0];
	this.submit();
}
var kolumnoj;
var lingvonomoj;
function AldoniTr(tr) {
	var html = '';
	var html = kolumnoj[0];
	var knr = 1;
	$(tr.split(/\t/)).each( function() {
		html += this + kolumnoj[knr];
		knr++;
	});
	html += kolumnoj[knr];
	try {
		$(serchorezultotbody).append(html);
	}
	catch(e) {
		//console.log(e, html);
	}
}
function Raporti() {
	var date = new Date();
	t2 = date.valueOf();
	MalplenigiIframe();
}
