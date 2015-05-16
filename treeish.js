/*
	s = "a(b(e(j))(d))c";
	o = "(";
	c = ")";
	//s="a(b)c"
	t=tree(s, o, c);
	//"ftyu".indexOf(/y/)
	tree_join(t,o,c) === s;
	
	// !!!!!!!!!!!!!!!!!! fail at (str === tree_join(tree(str, open, close), open, close))
	"()" et "" renvoient []
	"a()b()c" renvoit ['a','b','c']
	")())"  renvoit [')',')']

	to
	
	open as array
	open as regexp ?
	close as array
	close as regexp ?
	close as function
	
	
*/

function dual(str, open, close){
	var i_op= str.indexOf(open),
		l_op=open.length,
		l_clo=close.length;
	if(i_op<0){
		if(str.indexOf(close)>-1) throw new Error("Malformed close at " + str.indexOf(close));
		return [str, "", ""];
	}
	var start = str.substring(0, i_op),
		remain = str.substring(i_op + l_op),
		n_open = 1,
		i_clo,
		middle = "";
	if(start.indexOf(close)>-1) throw new Error("Malformed close at " + start.indexOf(close));
			
	while(n_open){
		i_clo = remain.indexOf(close),
		i_op = remain.indexOf(open);
		if(i_clo<0) throw new Error("Malformed open (no close) at " + i_op);
		if(i_op<0 || i_op > i_clo){
			n_open--;
			if(n_open) middle += remain.substring(0, i_clo+l_clo);
			else middle += remain.substring(0, i_clo);
			remain = remain.substring(i_clo + l_clo);
		}else{
			n_open++;
			middle += remain.substring(0, i_op + l_op);
			remain = remain.substring(i_op + l_op);
		}
	}
	return [start, middle, remain];
}


function tree(str, open, close){
	var arr = dual(str, open, close),
	
		prefix = arr[0],
		subtree = arr[1],
		unprocessed = arr[2];

	//console.log("proceed: " + str); 
	//console.log(arr); 
	
	if(subtree !== "") subtree = tree(subtree, open, close);
	if(unprocessed !== "") unprocessed = tree(unprocessed, open, close);

    var res = [];
    
    
    
    if(prefix !== "") res.push(prefix);
    if(subtree !== "") res.push(subtree);
    if(unprocessed !== ""){
		var i=0;
		for(;i<3;i++){
			if(i== 0 && typeof unprocessed[i] == "string" && unprocessed[i].indexOf(close)>-1) throw new Error("Malformed trailing closed");
		
			
			if(unprocessed[i]) res.push(unprocessed[i]);
		}
	}
	return res;
}

function tree_join(t, open, close){
	var res = "",
		i=0,
		l=t.length;
	for(;i<l;i++){
		if(typeof t[i] !== "string"){
			res += open + tree_join(t[i], open, close) + close;
		}else{
			res += t[i];
		}
	}
	return res;
}

