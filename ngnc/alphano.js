/*
   Copyright (c) [2021] [Dejun Yuan]
   [NGNc] is licensed under Mulan PSL v2.
   You can use this software according to the terms and conditions of the Mulan PSL v2. 
   You may obtain a copy of Mulan PSL v2 at:
            http://license.coscl.org.cn/MulanPSL2 
   THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.  
   See the Mulan PSL v2 for more details.  
 */

var prepos = null;
var curcolor = 'r';
var clicknum = 0;
var box2 = new Image(); //createBox('box2.png');
var box = new Image(); //createBox('box.png')

/*
function createBox(name) {
    var img = new Image()
    img.src = '/js/gc/images/'+name
    board.appendChild(img)
    img.style.display = 'none'
    img.style.position = 'absolute'
    return img
}*/

function AlphaNoifMustEat( p )
{
    var pos = { r:bdy(p), c:bdx(p) };

    alertclear();
    // clear msg area.
    if ( matrix[pos.r][pos.c] != null &&
         matrix[pos.r][pos.c].color != curcolor )
    {
        msgalert("不是你下，是对方下！");
        return true;
    }

    return ifMustEat( pos, curcolor );
}

function countXLineChess(prepos, pos, samepre){
    var r = prepos.r
    var c = prepos.c
    var dr = pos.r - prepos.r
    var dc = pos.c - prepos.c
    var ar = (dr > 0) ? dr : -dr
    var ac = (dc > 0) ? dc : -dc
    if ( ar != ac ) return -1;

    var ret= 0, cnt = 0;
    for ( cnt=0; cnt<ar; cnt++ )
    {
        if ( dr > 0 && dc > 0 )
        {
            if (matrix[r+cnt][c+cnt] != null) { 
                g_lastXcheck = { r:matrix[r+cnt][c+cnt].r,
                                 c:matrix[r+cnt][c+cnt].c };
                ret++; if ( !samepre && cnt > 0 && 
                matrix[r+cnt][c+cnt].color == 
                matrix[prepos.r][prepos.c].color ) 
                return -1; }
        } else
        if ( dr > 0 && dc < 0 )
        {
            if (matrix[r+cnt][c-cnt] != null) { 
                g_lastXcheck = { r:matrix[r+cnt][c-cnt].r,
                                 c:matrix[r+cnt][c-cnt].c };
                ret++; if ( !samepre && cnt > 0 && 
                matrix[r+cnt][c-cnt].color == 
                matrix[prepos.r][prepos.c].color ) 
                return -1; }
        } else
        if ( dr < 0 && dc > 0 )
        {
            if (matrix[r-cnt][c+cnt] != null) { 
                g_lastXcheck = { r:matrix[r-cnt][c+cnt].r,
                                 c:matrix[r-cnt][c+cnt].c };
                ret++; if ( !samepre && cnt > 0 && 
                matrix[r-cnt][c+cnt].color == 
                matrix[prepos.r][prepos.c].color ) 
                return -1; }
        } else
        if ( dr < 0 && dc < 0 )
        {
            if (matrix[r-cnt][c-cnt] != null) { 
                g_lastXcheck = { r:matrix[r-cnt][c-cnt].r,
                                 c:matrix[r-cnt][c-cnt].c };
                ret++; if ( !samepre && cnt > 0 && 
                matrix[r-cnt][c-cnt].color == 
                matrix[prepos.r][prepos.c].color ) 
                return -1; }
        }
    }
    return ret
}

function countLineChess(prepos, pos){
    var r = prepos.r
    var c = prepos.c
    var cnt = 0
    if (r != pos.r) {
        while (r != pos.r) {
            if (matrix[r][c] != null) cnt++
            if (r < pos.r) r++
            if (r > pos.r) r--
        }
//        if (matrix[r][c] != null) cnt++ // 不检测目标是否有棋子。
    }
    else {
        while (c != pos.c) {
            if (matrix[r][c] != null) cnt++
            if (c < pos.c) c++
            if (c > pos.c) c--
        }
//        if (matrix[r][c] != null) cnt++   // 不检测目标是否有棋子。
    }
    return cnt
}

function createChessOne( r, c, ch ) {
    var color = 'b';
    if (ch >= 'a' && ch <= 'z') {
        color = 'r';
    }
    var pi = getQueryString("p");
    var pistr = "";
    if ( pi != null && pi > 0 ) pistr = pi;

    var type = getChessTypeScript(ch).n;
//    var img_url = "/js/gc/images/"+color+"_"+type+pistr+".png";
//    var img = new Image();
//    img.src = img_url;
//    img.className = 'chess';
//    board.appendChild(img);
    var chess = {};
    chess.ch = ch;
    chess.r = r;
    chess.c = c;
    chess.color = color;
//    chess.img = img;
    chess.type = type;
//    if ( gIsRectBoard ) {
//        chess.x = c * g_rsize ;// + g_rsize/2 - g_row*15 - ((50-20)/2);
//        chess.y = r * ( g_rsize );// + 30
//        chess.x = ( c + 4/2 + 1/*2*(11-g_col + 1 + 1) */)  * g_rsize; //  + r * 30;// + 30 - g_row*15 - ((50-20)/2);
//        chess.y = ( r + /*(g_col-g_row)/2 - */1/2 ) * g_rsize; // ( 60 - 7 );// + 30
//    } else {
//        chess.x = c * g_rsize + r * g_rsize/2;// + g_rsize/2 - g_row*15 - ((50-20)/2);
//        chess.y = r * ( g_rsize - 7 );// + 30
//    }

//    img.style.position = 'absolute';
//    img.style.top = chess.y+"px";
//    img.style.left = chess.x + "px";

    if ( type == "king" ) {
        bdrecttds[r][c].innerHTML = '<img width="20" src="'+ch+color+'.png">';
        bdrecttds[r][c].style.padding="0"; }
    else {
        if ( color == 'r' ) color = 'w';
        bdrecttds[r][c].innerHTML = '<img width="20" src="'+color+'.png">';
        bdrecttds[r][c].style.padding="0"; }
    return chess;
}

function initmatrix(r,c, ret=null)
{
    var binit = ( ret == null );
    if ( binit )    
       ret = new Array(r);
    for (var i = 0; i < r; i++)
    {
        if ( binit )
            ret[i] = new Array(c);
        for ( var j=0; j<c; j++ ) {
            ch = bdpos2clr(i,j,true);
            if ( ch != '' )
                ret[i][j] = createChessOne(i, j, ch);
            else
                ret[i][j] = null;
        }
    }
    return ret;
}

function checkMove(sel, p){

    alertclear();
    // clear msg area.

    prepos = { r:bdy(sel), c:bdx(sel) };
    if ( matrix[prepos.r][prepos.c] == null )
        return -1;

    var pos = { r:bdy(p), c:bdx(p) };
    var res = fcscript_trans( prepos,pos );

        if (res == 0) {

            if ( beforeMoveChessTo( pos, curcolor) )
            {
//                box.style.display = 'none'
//                box2.style.display = 'none'
//                clicknum++;
                return -5;
            }
/*
            moveChessTo(prepos, pos)
            checkFinish( curcolor );

            if ( afterMoveChessTo( pos, curcolor) )
            {
                 return;
            }

            if ( clrcheck ) {
                if (curcolor == 'b'){
                    curcolor = 'r'
                }
                else {
                    curcolor = 'b'
                }
            }
*/
        }
        else if (res == -1){
            msgalert("没有选中棋子！")
        }
        else if (res == -2){
            msgalert("不是你下，是对方下！")
        }
        else if (res == -3){
            msgalert("不能吃自己的棋子！")
        }
        else if (res == -4){
            msgalert("在原地下子！")
        }
        else if (res == -5){
            msgalert("不符合行棋规则！")
        }
    return res;
}

function publishmsg( msg ){}
function alphano_after( p )
{
    var pos = { r:bdy(p), c:bdx(p) };
            if ( afterMoveChessTo( pos, curcolor) )
            {
                 return true;
            }

            if ( location.href.indexOf( "yit.html" ) > 0 )
            {
                 initmatrix( g_row, g_col, matrix );
                 var str = matrix2str();
                 publishmsg( "rec;" + curcolor + ';' + str );
            }

            if ( clrcheck ) {
                if (curcolor == 'b'){
                    curcolor = 'r'
                }
                else {
                    curcolor = 'b'
                }
            }
     return false;
}

function AlphaNoDeleteChess( r, c, delback )
{
    if ( g_curMustEatMovPos > 0 )
    domoveclearxy( parseInt(r), parseInt(c) );
    else 
    domoveclearxy( r, c );
}