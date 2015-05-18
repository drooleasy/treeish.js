
function indexAndLengthOf(str, token, start){
	if(token instanceof Function) token = token();
	start = start || 0;
	str = str.substring(start);
	var index = -1, 
		length = 0,
		m=null;
	if(token instanceof RegExp){
		var m = token.exec(str);
		if(m){ 
			index = m.index + start;
			length = m[0].length;
			m = m[0]
		}
	}else{
		index = str.indexOf(token);
		if(index!=-1){ 
			length = token.length;
			m=token;
		}
	}
	return {
		index:index,
		length:length,
		match:m
	}
}

function allIndexesAndLengthOf(str, token, start){
	if(token instanceof Function) token = token();
	start = start || 0;
	str = str.substring(start);
	var res = {
		indexes : [], 
		lengths : [],
		matches : []
	};
	if(token instanceof RegExp){
		var m = token.exec(str);
		while(m!==null){ 
			res.indexes.push(m.index + start);
			res.lengths.push(m[0].length);
			res.matches.push(m[0]);
			// avoid problem if regexp is not global
			str = str.substring(m.index + m[0].length);
			start += m.index + m[0].length;
			token.lastIndex = 0;
			m = token.exec(str);
		}
	}else{
		index = str.indexOf(token);
		while(index!=-1){ 
			res.lengths.push(token.length);
			res.matches.push(token);
			res.indexes.push(index+start);
			index = str.indexOf(token, index+1);
		}
	}
	return res;
}


function findNotEscaped(str, token, escape, start){
	start = start || 0;
	
	if(token instanceof Function) token = token();
	if(escape instanceof Function) escape = escape();
	
	var token_matches = allIndexesAndLengthOf(str,token, start);
	var escape_matches = allIndexesAndLengthOf(str,escape, start);
	var i_token=0,
		i_escape=0,
		i_escape_back,
		escape_back_pos,
		escape_count,
		l_token=token_matches.indexes.length,
		l_escape=escape_matches.indexes.length,
		pos,
		posAfter,
		escaped;
		
	for(;i_token<l_token;i_token++){	
		pos = token_matches.indexes[i_token];
		escaped = false;
		for(i_escape=0;i_escape<l_escape;i_escape++){
			escape_back_pos = escape_matches.indexes[i_escape];
			posAfter = escape_back_pos + escape_matches.lengths[i_escape];
			escape_count=0;
			if(posAfter == pos){
				//checks for parity
				i_escape_back = i_escape-1;
				escape_count=1;
				while(i_escape_back>-1){
					if(escape_matches.indexes[i_escape_back] + escape_matches.lengths[i_escape_back] !== escape_back_pos){
						break;
					}
					escape_count++;
					escape_back_pos = escape_matches.indexes[i_escape_back];
					i_escape_back--;
				}
			
				if(escape_count % 2 == 1){
					escaped = true;
				}	
			}
		}
		if(!escaped){
			//return token_matches.indexes[i_token];
			return {
				index:token_matches.indexes[i_token],
				length:token_matches.lengths[i_token],
				match:token_matches.matches[i_token]
			};
		}
	}
	//return -1;
	return {
		index:-1,
		length:0,
		match:null
	
	};
}

function findAllNotEscaped(str, token, escape){
	var all = [],
		find = findNotEscaped(str, token, escape);
	while(find.index != -1){
		all.push(find);
		find = findNotEscaped(str, token, escape, find.index+find.length);
	}
	return all; 
}

function executable(f){
	var args = [],
		i=1,
		l=arguments.length;
	for(;i<l;i++){
		args.push(arguments[i]);
	}
	
	return function(){
		return f.apply(null, args);
	}
}

function findAllNotEscaped(str, token, escape){
	var all = [],
		find = findNotEscaped(str, token, escape);
	while(find.index != -1){
		all.push(find);
		find = findNotEscaped(str, token, escape, find.index+find.length);
	}
	return all; 
}






function dual(str, open, close, escape){

	if(open instanceof Function) open = open(str); 
	if(escape instanceof Function) escape = escape(str); 
	var openeds = findAllNotEscaped(str,open,escape);
	if(!(close instanceof Function)) {
		var lonely_open = findNotEscaped(str, close, escape);
		if(lonely_open.index != -1 && (!openeds.length || lonely_open.index < openeds[0].index))
			throw new Error("Malformed ")
	}
	var i=0; 
	var l = openeds.length;
	
	var count = 0;
	for(;i<l;i++){
		var opened = openeds[i],
			close_token = close;
		if(close instanceof Function) close_token = close(str, opened, open);
		count++;
		var closeds = findAllNotEscaped(str,close_token ,escape);
		var j=0;
		for(;j<closeds.length;j++){
			var closed = closeds[j];
			var condition = ((i+1) == l || closed.index < openeds[i+1].index);
			if(close instanceof Function) condition=true;
			if(closed.index > opened.index && condition){
				count--;
				if(count==0){
					return [
						str.substring(0, openeds[0].index),
						str.substring(openeds[0].index+openeds[0].length, closed.index),
						str.substring(closed.index + closed.length),
					];
				}
			} 
		}
		
	}
	if(count!=0) throw new Error("Malformed : openeds count=" + count )
	return [str, "", ""];
	
}
function unescape(str, escape){
	var tmp ="";
	var rst = str;
	var i_to_unescape = rst.indexOf(escape);
	while(i_to_unescape>-1){
		tmp += rst.substring(0, i_to_unescape);
		rst = rst.substring(i_to_unescape + escape.length)
		i_to_unescape = rst.indexOf(escape);
		var save = true;
		while(i_to_unescape==0){
			if(save) tmp+= escape;
			save=!save; 
			rst = rst.substring(i_to_unescape + escape.length)
			i_to_unescape = rst.indexOf(escape);
		}
	}
	tmp += rst;

	return tmp;
	
}


function tree(str, open, close, escape){
	var arr = dual(str, open, close, escape),
		prefix = arr[0],
		subtree = arr[1],
		unprocessed = arr[2];

	if(subtree !== "") subtree = tree(subtree, open, close, escape);
	if(unprocessed !== "") unprocessed = tree(unprocessed, open, close, escape);

    var res = [];
    
    
    if(prefix !== ""){
		res.push(unescape(prefix, escape));
	}
    if(subtree !== "") res.push(subtree);
    if(unprocessed !== ""){
		var i=0;
		for(;i<3;i++){
			if(i== 0 
				&& typeof unprocessed[i] == "string" 
				&& !(close instanceof Function) 
				&& findNotEscaped(unprocessed[i], close, escape)>-1){ 
				throw new Error("Malformed trailing closed");
			}
			if(unprocessed[i]){ 
				res.push(unprocessed[i]);
			}
		}
	}
	return res;
}

function tree_join(t, open, close, escape){
	var res = "",
		i=0,
		l=t.length,
		i_to_escape,
		tmp, rst;
	for(;i<l;i++){
		if(typeof t[i] !== "string"){
			res += open + tree_join(t[i], open, close, escape) + close;
		}else{ // an array !
			i_to_escape= t[i].indexOf(open);
			tmp="";
			rst=t[i];
			while(i_to_escape!=-1){
				tmp += rst.substring(0, i_to_escape) + escape + open;
				rst = rst.substring(i_to_escape+open.length);
				i_to_escape = rst.indexOf(open);
			}
			tmp += rst;
			rst=tmp;
			tmp="";	
			i_to_escape = rst.indexOf(close);
			while(i_to_escape!=-1){
				tmp += rst.substring(0, i_to_escape) + escape + close;
				rst = rst.substring(i_to_escape+close.length);
				i_to_escape = rst.indexOf(close);
			}
			tmp += rst;
			res += tmp;
		}
	}
	return res;
}

