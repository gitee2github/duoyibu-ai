/*
   Copyright (c) [2021] [Dejun Yuan]
   [NGNc] is licensed under Mulan PSL v2.
   You can use this software according to the terms and conditions of the Mulan PSL v2. 
   You may obtain a copy of Mulan PSL v2 at:
            http://license.coscl.org.cn/MulanPSL2 
   THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.  
   See the Mulan PSL v2 for more details.  
 */

var bUsingFSmind = false;
var gFSmindStr = null;
var gBotNumber = -1;

function enableFSmind( bl, mindstr = null )
{
    bUsingFSmind = bl;
    if ( mindstr != null ) gFSmindStr = mindstr;
}

function fmind( clr, skip )
{

   var urlclr = getQueryString( "clr" );
   // check the curcolor.
   if ( !( ( curcolor == 'r' && urlclr != null && urlclr == 'b' ) ||
           ( curcolor == 'b' && urlclr != null && urlclr == 'w' ) ) ) return;

   var thinkrec = {l:0,r:10,t:0,b:10};
   var curp = getQueryString( "p" );
   if ( curp > '0' )
       thinkrec = {l:1,r:9,t:1,b:9};

   var allclr="";
   var allblk="";
   for ( var i=thinkrec.t; i<thinkrec.b; i++ )
   {
      for ( var j=thinkrec.l; j<thinkrec.r; j++ )
      {
          var isgray = ( i-2*Math.floor(i/2) ) == ( j-2*Math.floor(j/2) );
          if ( !isgray )
          {
              var ch = bdpos2clr(i,j);
              var pos = (i*10+j);
              if ( ch == "" ) {
                 allblk += pos + ";";
              } else {
    var curclr = 'b';
    if (ch >= 'a' && ch <= 'z') {
        curclr = 'r';
    }
              if ( curclr == clr )

                 if ( !AlphaNoifMustEat( pos ) )
                    // check for must eat.

                 allclr += pos + ',' + curclr + ";";
              }
          }
      }
   }

   var ret="";
   var allclrfs = fcscript_init( allclr );
   var allblkfs = fcscript_init( allblk ); 

   for ( var i=0; i<allclrfs.length; i++ )
   for ( var j=0; j<allblkfs.length; j++ )
   {
       var src = parseInt( allclrfs[i][0] );
       var dest = parseInt( allblkfs[j][0] );

       // save musteat.
       var bakstr = g_curMustEatP;
       var bakpos = g_curMustEatMovPos;
       var bakdel = g_deletallMustEat;

       // check move.
       if ( checkMove(src, dest) == 0 ) {
           ret += src + "," + allclrfs[i][1] + ',' + dest + ";";

           // restore the musteat.
           g_curMustEatP = bakstr;
           g_curMustEatPs = fcscript_init( bakstr );
           if ( g_curMustEatPs.length == 0 ) g_curMustEatPs = null;
           g_curMustEatMovPos = bakpos;
           g_deletallMustEat = bakdel;
       }
   }

   console.log( "rand:"+ret );

   if ( bUsingFSmind )
   {    ret = FSmind( ret );
        console.log( "    result:"+ret ); }

   var retfs = fcscript_init( retonlyret(ret) );
   var retmustfs = fcscript_init( retonlymust(ret) );

   if ( retfs.length == 0 )
       retfs = retmustfs;
//   retfs = fcscript_init( ret );
   if ( retfs.length > 0 )
   {
      var randmov = parseInt( Math.random() * retfs.length );
      var msg = retfs[randmov][0] + "," + retfs[randmov][1] + "," + retfs[randmov][2];
      console.log( "    movs:" + randmov + ":" + msg );

                 if ( !AlphaNoifMustEat( retfs[randmov][0] ) )
                    // check for must eat.
          if ( checkMove( retfs[randmov][0], retfs[randmov][2] ) == 0 ) 
          {
      domovebat( retfs[randmov][0], retfs[randmov][1], retfs[randmov][2], false );

      matrix = initmatrix( g_row, g_col, matrix );
      var recs = matrix2str();
      lastSteps += recs + ',';

      alertclear();
      msgalert( msg, 0 );
      lastSteps += msg + ";";
           }
   } else
   {
      alertclear();
      msgalert( "'"+clr + "' was lost." + "<br>" +
                "<button onclick='replayno();'>replay</button>", 0 );

      // stop the interval.
      clearInterval( myInter );
   }
}

var myInter;

//msgalert( "<button onclick='startno();alertclear();'>start</button>", 0 );

function startno( speed )
{

    speed = beforestartno( speed );

myInter = setInterval(function () {
        fmind(curcolor,speed/1000);
    }, speed);
}

var lastSteps = "";
var lastStepsfs = null;
var lastStepsPos = -1;

function replayno()
{
      // show the last steps.
      bdrecttds = initbdtds( 'e','d','c');
      paintboard( chesspos, true );
      matrix = initmatrix( g_row, g_col );

      // set the replay btns.
      alertclear();
msgalert( "<button onclick='backwardno();'><<</button>" +
          "<button onclick='playno();'>reset</button>" +
          "<button onclick='forwardno();'>>></button>", 0 );

      lastStepsfs = fcscript_init( lastSteps );
      lastStepsPos = 0;
}

function backwardno()
{
    lastStepsPos --;
    if ( lastStepsPos < 0 )
        playno();
    else
    paintboard( lastStepsfs[lastStepsPos][0], true );
}

function playno()
{
    lastStepsPos = -1;
    paintboard( chesspos, true );
}

function stopno()
{
}

function forwardno()
{
    lastStepsPos ++;
    if ( lastStepsPos >= lastStepsfs.length )
        lastStepsPos = lastStepsfs.length-1;
    paintboard( lastStepsfs[lastStepsPos][0], true );
}


/*



  FSmind()



 */

function beforestartno( speed )
{
//    p=3&bot=,20200715002-1594880416669,1594880416669;&clr=w

    var urlp = getQueryString( "p" );
    var botp = getQueryString( "bot" );
    var clrp = getQueryString( "clr" );
    var spdp = getQueryString( "speed" );

    if ( botp != null )
    {
        var botfs = fcscript_init( botp );
        if ( botfs.length == 1 &&
             botfs[0].length == 3 )
        {
            var tmpi = botfs[0][1].indexOf( botfs[0][2] );
            if ( tmpi > 0 &&
                 botfs[0][1][tmpi-1] == '-' &&
//               ( botfs[0][1].substring( tmpi-4, tmpi-1 ) == "002" ||
//                 botfs[0][1].substring( tmpi-4, tmpi-1 ) == "003" ) &&
                 urlp != null && urlp == '3' )
            {
                if ( botfs[0][0] == "34" &&
                   ( botfs[0][1].substring( tmpi-4, tmpi-1 ) == "002" ||
                     botfs[0][1].substring( tmpi-4, tmpi-1 ) == "003" ) 
                   )
                {
                    bUsingFSmind = true;
                    gFSmindStr = "godeath,false;front1st;";
                    gBotNumber = 34;
                } else
                if ( botfs[0][0] == "35" &&
                   ( botfs[0][1].substring( tmpi-4, tmpi-1 ) == "004" ||
                     botfs[0][1].substring( tmpi-4, tmpi-1 ) == "005" ) 
                   )
                {
                    bUsingFSmind = true;
                    gFSmindStr = "godeath,true;godeath,false;";
                    gBotNumber = 35;
                }
            }
        }             
    }

    if ( spdp != null )
        speed = parseInt( spdp );
    return speed;
}

function FSmind( ret, mindstr = null )
{
    if ( mindstr == null )
         mindstr = gFSmindStr;
    if ( mindstr == null )
        return ret;

    var mindfs = fcscript_init( mindstr );
    if ( mindfs != null )
    for ( var j=0; j<mindfs.length; j++ )
    {
        var retfs = fcscript_init( ret );
        if ( retfs != null )
            if ( retfs.length <= 1 ) return ret;
            else ret = eachFSmind( mindfs[j], retfs );
    }

    // default terminating the mind thinking.
    return ret;  
}

function eachFSmind( minds, retfs )
{
    if ( minds[0] == "godeath" &&
         minds[1] == 'true' &&
         retfs.length > 1 )  // multipath select attack by musteat.
        return goQiang( retfs );


    var ret = "";
    for ( var i=0; i<retfs.length; i++ )
        ret += eachFSmindMove( minds, retfs[i] );
    return ret;
}

function str2matrix(r,c, str)
{
    var ret = new Array(r);
    for (var i = 0; i < r; i++)
    {
        ret[i] = new Array(c);
        for ( var j=0; j<c; j++ ) {
            ch = str[i*c+j];
            if ( ch != '0' )
                ret[i][j] = createChessOne(i, j, ch);
            else
                ret[i][j] = null;
        }
    }
    return ret;
}

function delmatrix( mat )
{
    if ( mat != null )
    {
        for ( var i=0; i<mat.length; i++ )
        {
            if ( mat[i] != null )
                delete mat[i];
        }
        delete mat;
    }
}

function eachFSmindMove( minds, rets )
{
    var ret = "";
    var add = "";

if ( minds[0] == "godeath" )
{
    // save current board.
    var bdsaved = matrix2str();
    var matrixsaved = matrix;
    var colorsaved = curcolor;

    // sim act the move.
    var simbd = "";
    var min, max;
    if ( rets[0] < rets[2] )
    {    min = parseInt(rets[0]); max = parseInt(rets[2]);
    } else { min = parseInt(rets[2]); max = parseInt(rets[0]); }

        simbd += bdsaved.substring( 0, min ) 
               + bdsaved[max]
               + bdsaved.substring( min+1, max )
               + bdsaved[min]
               + bdsaved.substring( max+1, bdsaved.length );

//    matrix = str2matrix( g_row, g_col, simbd );
    var pr = { r:bdy(rets[0]), c:bdx(rets[0]) };
    var ps = { r:bdy(rets[2]), c:bdx(rets[2]) };

//    moveChessTo( pr, ps);
//    var chessto = matrix[ps.r][ps.c];
if ( matrix[ps.r][ps.c] == null )
{
    matrix[ps.r][ps.c] = matrix[pr.r][pr.c];
    matrix[pr.r][pr.c] = null;
    matrix[ps.r][ps.c].r = ps.r;
    matrix[ps.r][ps.c].c = ps.c;

    //del mid if nessaray
    if ( ( ps.r - pr.r == 2 || ps.r - pr.r == -2 ) &&
         ( ps.c - pr.c == 2 || ps.c - pr.c == -2 ) )
    {
        if ( matrix[ps.r-((ps.r-pr.r)/2)][ps.c-((ps.c-pr.c)/2)] != null &&
             matrix[ps.r][ps.c] != null )
        if ( matrix[ps.r-((ps.r-pr.r)/2)][ps.c-((ps.c-pr.c)/2)].color != 
             matrix[ps.r][ps.c].color )
           matrix[ps.r-((ps.r-pr.r)/2)][ps.c-((ps.c-pr.c)/2)] = null;
    }

    // check must eat.
    if ( curcolor == 'r' ) curcolor = 'b';
    else curcolor = 'r';


       // save musteat.
       var bakstr = g_curMustEatP;
       var bakpos = g_curMustEatMovPos;
       var bakdel = g_deletallMustEat;

       g_curMustEatP = null;
       g_curMustEatPs = null;
       g_curMustEatMovPos = -1;
       g_deletallMustEat = "";
    
    ifMustEatPK( 25, curcolor );

    var ismust = ( g_curMustEatPs != null &&
                   g_curMustEatPs.length > 0 )

    if ( ismust ) {
        console.log( "    del:" + rets[0] + "," + rets[1] + "," + rets[2] + ", must:"+g_curMustEatP );
        add = rets[0] + "," + rets[1] + "," + rets[2] + "," + matrix2str() + ',';
        for ( var i=0; i<g_curMustEatPs.length; i++ )
        {
            add += g_curMustEatPs[i].length + ',';
            for ( var j=0; j<g_curMustEatPs[i].length; j++ )
            {  
                add += g_curMustEatPs[i][j] + ',';
            }
        }
        add = add.substring( 0, add.length-1 ) + ";";
    }

           // restore the musteat.
           g_curMustEatP = bakstr;
           g_curMustEatPs = fcscript_init( bakstr );
           if ( g_curMustEatPs.length == 0 ) g_curMustEatPs = null;
           g_curMustEatMovPos = bakpos;
           g_deletallMustEat = bakdel;
}

        // restore the matrix.
        delmatrix( matrix );
        matrix = str2matrix( g_row, g_col, bdsaved);
        curcolor = colorsaved;

    // if must. return ""
    if ( ismust )
    {
        return add;
    }

}

    // else return elder.
    for ( var i=0; i<rets.length; i++ )
       ret += rets[i] + ",";
    return ret.substring( 0, ret.length-1 ) + ";";
}


function retonlyret(ret)
{
   var fs = fcscript_init( ret );  
   ret = "";
   for ( var i=0; i<fs.length; i++ )
   {
      if ( fs[i].length == 3 )
         ret += fs[i][0] + "," + fs[i][1] + "," + fs[i][2] + ";"
   }
   console.log( "only:" + ret );
   return ret;  
}

function retonlymust(ret)
{
   var fs = fcscript_init( ret );  
   ret = "";
   for ( var i=0; i<fs.length; i++ )
   {
      if ( fs[i].length > 3 )
      {
         for ( var j=0; j<fs[i].length; j++ )
            ret += fs[i][j] + ","
         ret = ret.substring( 0, ret.length-1 ) + ";"
      }
   }
   console.log( "must:" + ret );

   // delete the longer must 1st.
   fs = fcscript_init( ret );
   var len = "";
   for ( var i=0; i<fs.length; i++ )
   {
       var curlen = 0;
       var curmax = 0;
       var j=4;
       while( j<fs[i].length )
       {
           if ( curmax < parseInt( fs[i][j] ) )
               curmax = parseInt( fs[i][j] );
           j += 1 + parseInt( fs[i][j] );
           curlen ++;
       }
       len += i + "," + curmax + "," + curlen + ";";
   }

   var lenfs = fcscript_init( len );
   var minlen = -1;
   // sorting less.
   for ( var i=0; i<fs.length; i++ )
   {
       if ( minlen == -1 )
           minlen = i;
       else
       if ( lenfs[minlen][1] > lenfs[i][1] )
           minlen = i;
   }
   if ( minlen != -1 )
   {   minlen = lenfs[minlen][1];
   
       var add = "";
   // output the minmax only.
       for ( var i=0; i<fs.length; i++ )
       {
           if ( lenfs[i][1] == minlen )
           {
               for ( var j=0; j<fs[i].length; j++ )
                   add += fs[i][j] + ',';
               add = add.substring( 0, add.length-1 ) + ";"
           }
       }
       ret = add;
   }

   return ret;  
}

function goQiang( retfs )
{
   var bdsaved = matrix2str();
   return goQiangBDrect( retfs, bdsaved );
}

function goQiangBDrect( retfs, bdrects )
{
    var ret = "";
    for ( var i=0; i<retfs.length; i++ )
    {
        ret += goGetMustEat( retfs[i], bdrects );
    }
    var musteatretfs = fcscript_init( ret );
    if ( musteatretfs.length > 0 )
    {
        // check each musteat result.
        // rets, r number, b number, boardrect;

        // rebuild retfs.
        ret = "";
        for ( var i=0; i<musteatretfs.length; i++ )
        {
           for ( var j=0; j<musteatretfs[i].length; j++ )
           {
               ret += musteatretfs[i][j] + ",";
           }
           ret = ret.substring( 0, ret.length-1 ) + ";";

           // if the musteat branch simrun continue.
           if ( musteatretfs[i].length > 3 )
           {
               var cldmovs = "";
               for ( var k=0; k<musteatretfs[i][4]; k++ )
                   cldmovs += musteatretfs[i][4+1+k] + ',';
               var cldmovsfs = fcscript_init( cldmovs.substring( 0, cldmovs.length-1 ) + ";" );

               ret = ret.substring( 0, ret.length-1 ) + ","
               // run it.
               ret += goQiangBDrect( fcscript_init(mustidx2pos( cldmovsfs )), musteatretfs[i][3] );
           }
        }
    }

    return ret;
}

function mustidx2pos( cld )
{
    var ret = "";

    for ( var i=0; i<cld.length; i++ )
    {
        ret += cld[i].length + ',';
    for ( var j=0; j<cld[i].length; j++ )
    {
        if ( cld[i][j] >= '1' && cld[i][j] <= '50' )
        {
            var chess = dr_xys_getchess( parseInt(cld[i][j]) );
            if ( chess != null )
            {
                var pos = chess.r * 10 + chess.c;
                if ( j/2 == parseInt(j/2) )
                    ret += pos + ',';
                else
                    ret += chess.color;
                continue;
            }
        }
        ret += cld[i][j] + ',';
    }
       
    }

    if ( ret.length > 0 )
        ret = ret.substring( 0, ret.length-1 ) + ";";

    return ret;
}

/*
    // else return elder.
    for ( var i=0; i<rets.length; i++ )
       ret += rets[i] + ",";
    return ret.substring( 0, ret.length-1 ) + ";";
*/

function goGetMustEat( rets, bdrects )
{
    var ret = "";
    // else return elder.
    for ( var i=0; i<rets.length; i++ )
       ret += rets[i] + ",";
    ret = ret.substring( 0, ret.length-1 ) + ";";
 
    // move

    // count r & b;

    // record.

    // restore.

    var sim = sim_MoveTo_MRC( rets, bdrects );
    var simfs = fcscript_init( sim );
    if ( simfs == null ) return "";
    
    if ( simfs[0][0] == 'false' ) return ret;
    return sim.substring( 'true,'.length, sim.length );
}

function sim_MoveTo_MRC( rets, bdrects )
{
    var add = "";
    var cclr = rets[1];

    // save current board.
    var bdsaved = matrix2str();
    var colorsaved = curcolor;

    // next bdrects.
    delmatrix( matrix );
    matrix = str2matrix( g_row, g_col, bdrects);

    // sim act the move.
    var simbd = "";
    var min, max;
    if ( rets[0] < rets[2] )
    {    min = parseInt(rets[0]); max = parseInt(rets[2]);
    } else 
    {   min = parseInt(rets[2]); max = parseInt(rets[0]); }

        simbd += bdsaved.substring( 0, min ) 
               + bdsaved[max]
               + bdsaved.substring( min+1, max )
               + bdsaved[min]
               + bdsaved.substring( max+1, bdsaved.length );

//    matrix = str2matrix( g_row, g_col, simbd );
    var pr = { r:bdy(rets[0]), c:bdx(rets[0]) };
    var ps = { r:bdy(rets[2]), c:bdx(rets[2]) };

//    moveChessTo( pr, ps);
//    var chessto = matrix[ps.r][ps.c];
if ( matrix[ps.r][ps.c] == null )
{
    matrix[ps.r][ps.c] = matrix[pr.r][pr.c];
    matrix[pr.r][pr.c] = null;
    matrix[ps.r][ps.c].r = ps.r;
    matrix[ps.r][ps.c].c = ps.c;

    //del mid if nessaray
    if ( ( ps.r - pr.r == 2 || ps.r - pr.r == -2 ) &&
         ( ps.c - pr.c == 2 || ps.c - pr.c == -2 ) )
    {
        if ( matrix[ps.r-((ps.r-pr.r)/2)][ps.c-((ps.c-pr.c)/2)] != null &&
             matrix[ps.r][ps.c] != null )
        if ( matrix[ps.r-((ps.r-pr.r)/2)][ps.c-((ps.c-pr.c)/2)].color != 
             matrix[ps.r][ps.c].color )
           matrix[ps.r-((ps.r-pr.r)/2)][ps.c-((ps.c-pr.c)/2)] = null;
    }

    // check must eat.
    if ( cclr == 'r' ) curcolor = 'b';
    else curcolor = 'r';

       // save musteat.
       var bakstr = g_curMustEatP;
       var bakpos = g_curMustEatMovPos;
       var bakdel = g_deletallMustEat;

       g_curMustEatP = null;
       g_curMustEatPs = null;
       g_curMustEatMovPos = -1;
       g_deletallMustEat = "";
    
    ifMustEatPK( 25, curcolor );

    var ismust = ( g_curMustEatPs != null &&
                   g_curMustEatPs.length > 0 )

    if ( ismust ) {
        console.log( "    del:" + rets[0] + "," + rets[1] + "," + rets[2] + ", must:"+g_curMustEatP );
        add = rets[0] + "," + rets[1] + "," + rets[2] + "," + matrix2str() + ',';
        for ( var i=0; i<g_curMustEatPs.length; i++ )
        {
            add += g_curMustEatPs[i].length + ',';
            for ( var j=0; j<g_curMustEatPs[i].length; j++ )
            {  
                add += g_curMustEatPs[i][j] + ',';
            }
        }
        add = add.substring( 0, add.length-1 ) + ";";
    }

           // restore the musteat.
           g_curMustEatP = bakstr;
           g_curMustEatPs = fcscript_init( bakstr );
           if ( g_curMustEatPs.length == 0 ) g_curMustEatPs = null;
           g_curMustEatMovPos = bakpos;
           g_deletallMustEat = bakdel;
}

        // restore the matrix.
        delmatrix( matrix );
        matrix = str2matrix( g_row, g_col, bdsaved);
        curcolor = colorsaved;

    // if must. return ""
    if ( ismust )
    {
        return "true," + add;
    }

    return "false;";
}