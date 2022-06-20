
/***
 * json description
 * "#" - a # on line start to hide group or entry
 * first level is for link groups.
 * link groups starts with {title:"",info:"",opts:{},entries:[]}
 */

/*
 ** html element order
.groupsWrapper [flex] max-height column wrap
	.groups [flex] column nowrap
		.groupWrapper
			.groupTitle
			.groupLinks [flex]
				.linkPair
					a
*/

function mkElement(tag,parent,attrs,childs){
	var elem = document.createElement(tag);
	for(var label in attrs){
		if(label=="dataset"){
			for(var key in attrs.dataset){
				elem.dataset[key] = attrs.dataset[key];
			}
		}else if(label=="id" || label=="className" || label=="class"){
			if(label=="class") elem.className = attrs[label];
			else elem[label] = attrs[label];
		}else{
			elem.setAttribute(label,attrs[label]);
		}
	}
	if(typeof childs=="string") elem.innerHTML = childs;
	if(typeof childs=="object"){
		for(var i=0;i<childs.length;i++){
			elem.appendChild(childs[i]);
		}
	}
	if(parent && parent.appendChild) parent.appendChild(elem);
	return elem;
}

function links_init(result){
	var rows = [];
	var groups = [];
	var linklist = document.getElementById("linklist");
	for(var gIndex=0;gIndex<result.length;gIndex++){
		var group = result[gIndex];
		if(group==true){
			// create group 'line' breaker
			mkElement("div",linklist,{"class":"groupBreaker"});
		} else {
			// ignore group
			if(group.title.match(/^#/)) continue;

			// create group wrapper
			var wrapper = mkElement("div",linklist,{"class":"groupWrapper"});
			// create group title
			mkElement("div",wrapper,{"class":"groupTitle"},group.title);
			// create group info if exists
			if(group.info) mkElement("div",wrapper,{"class":"groupInfo"},group.info);
			// gen. attributes for group links container
			var attrs = {"class":"groupLinks"};
			if(group.opts){
				if(group.opts.singleMode==true)
					attrs.class += ' singleMode';
				if(group.opts.style)
					attrs.style = group.opts.style;
			}
			// create group links container
			var groupLinks = mkElement("div",wrapper,attrs);

			// loop through group entries
			for(var eIndex=0;eIndex<group.entries.length;eIndex++){
				var entry = group.entries[eIndex];

				// if entry a string convert to object; or ignore by #
				if( typeof entry=="string" ){
					// ignore entry
					if(entry.match(/^#/)) continue;
					entry = entry.split('^');
				}

				var linkpair = [];

				for(var lIndex=0;lIndex<entry.length;lIndex++){
					var link = entry[lIndex];
					if(link.match(/^#/)) continue; // ignore link

					link = link.split('|');

					if(link[0].match(/^http/) || link[0].match(/^\//)){
						if(link.length==1) link[1] = link[0];
						var attrs = {};
						attrs.target = "_blank"; // could replaced by opts.tar later
						attrs.href = link[0];
						linkpair.push(mkElement("a",null,attrs,link[1]));
					}else {
						linkpair.push(mkElement("div",null,{"class":"label"},link[0]));
					}
				}

				if(linkpair.length>0){
					var lpClass = "linkPair";
					if(entry.length>1)
						lpClass += " subLinks";
					mkElement("div",groupLinks,{"class":lpClass},linkpair);
				}

			}
		}
	}
}

function search_submit(id){
	var input = document.getElementById(id);
	if(!input) return false;
	window.open(input.dataset.target+input.value,"_blank");
	input.value="";
}

function search_init(result){
	let searchlist = document.getElementById("searchlist");
	for(let i=0;i<result.length;i++){
		let entry = result[i];
		let form = mkElement("form",searchlist,{"action":"#","method":"GET","onsubmit":"return false;"});
		let box = mkElement("div",form,{"class":"searchbox "+(entry[2] || "")});
		let label = mkElement("div",box,{},entry[0]);
		let input = mkElement("input",box,{"type":"text","id":"searchbox"+i,"dataset":{"target":entry[1]}});
		form.addEventListener("submit",function(){ search_submit("searchbox"+i); });
	}
}

function LoadData(url,callback){
	var con=null;
	try { con = new XMLHttpRequest(); }
	catch(e) {
		try { con = new ActiveXObject("Msxml2.XMLHTTP"); }
		catch(e) {
			try { con = new ActiveXObject("Microsoft.XMLHTTP"); }
			catch(e) {
				con = null;
			}
		}
	}
	if(con) {
		con.onreadystatechange = function(){
			if(con.readyState==4 && con.status==200){
				var data = con.responseText;
				callback(JSON.parse(data));
			}
		}
		con.open("GET",url,true);
		con.send(null);
	}
}

document.addEventListener("DOMContentLoaded", function(event){
	LoadData('./links.json',links_init);
	LoadData('./search.json',search_init);
});
