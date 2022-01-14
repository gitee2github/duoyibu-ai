/*
   Copyright (c) [2021] [Dejun Yuan]
   [NGNc] is licensed under Mulan PSL v2.
   You can use this software according to the terms and conditions of the Mulan PSL v2. 
   You may obtain a copy of Mulan PSL v2 at:
            http://license.coscl.org.cn/MulanPSL2 
   THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.  
   See the Mulan PSL v2 for more details.  
 */

    function pl_getpathname( pn )
    {
    var pathname = pn;

        // channel by path.
        var path = document.referrer.lastIndexOf( "/" );
        var path2 = document.referrer.substring( 0, path-1 ).lastIndexOf( "/" );
        var path3 = document.referrer.substring( 0, path2-1 ).lastIndexOf( "/" );
        if ( path > 0 &&
             path2 > 0 &&
             path3 > 0 )
           pathname = document.referrer.substring( path3+1, path2 ) +
                      document.referrer.substring( path2+1, path );
        return pathname;
    }

function pl_buildLocByTEAid( sub, subsub )
{
        var path = document.location.pathname.lastIndexOf( "/" );
        var path2 = document.location.pathname.substring( 0, path-1 ).lastIndexOf( "/" );
        var path3 = document.location.pathname.substring( 0, path2-1 ).lastIndexOf( "/" );
        if ( path > 0 &&
             path2 > 0 &&
             path3 > 0 )

             document.location = document.location.pathname.substring( 0, path3+1 ) +
                      sub + "/" + subsub + 
                      document.location.pathname.substring( path, document.location.pathname.length );
}


    function sim_getReady_hook() {

var boturl = getQueryString( "bot" );
if ( boturl != null )
{
    botfs = fcscript_init( boturl );
    if ( botfs.length == 1 &&
         botfs[0].length == 3 )
    {
        my_channel = botfs[0][1]; 
        idd = my_channel.substring( 0, my_channel.indexOf( "-" ) );


        if ( idd.substring(0,8) == "20200312" )
        {
           resetAppkeyToselfdef( "BC-1a44****a3ae****9cd2****b107****" );
        }
    }
}

        switch ( getQueryString( "clr" ) )
        {
        case 'b': 
            my_user = idd + 'b' + getTM();
            isSlave = false; break;
        case 'w': 
            my_user = idd + 'w' + getTM();
            isSlave = true; break;
        case null:
            mousehidden = true; // disable mouse input.
            my_user = idd + '_' + getTM();
            isSlave = false; break;
        }

        sim_newGC_hook( idd );

if ( getQueryString( "bot" ) != null ) {

var botTM = setInterval( function() {

    var plv = document.getElementById( "dive" );
    if ( plv.innerHTML.indexOf( "startno(600);" ) > 0 )
    {
        clearInterval( botTM );
        startno(600);alertclear();
    }
},500);

}

    }

var my_appkey = "BC-9593****2f88****9064****a1c4****";  // playok2.

        function sim_newGC_hook( id )
        {
            goEasy = new GoEasy({
                host: "hangzhou.goeasy.io",
                appkey: my_appkey,
                     // "BC-9593****2f88****9064****a1c4****",  // playok2.
                     // "BC-f23d****12c3****a20b****a731****",  // playok.
                userId: id
            });
            goEasy.subscribe({
                channel: my_channel,
                onSuccess: function () {
                    console.log("订阅成功");
                    publishmsg( "create;" + getQueryString( "clr" ) + ','
                                          + getQueryString( "usr" ) + ','
                                          + getQueryString( "code" )
                               );
                },
                onFailed: function (error) {
                    console.log("订阅失败: "+error.content);
                },onMessage: function (message) {
                    console.log("Channel:" + message.channel + " content:" + message.content);
                    sim_gcmsg_hook( message.content );
                }
            });
        }

function sim_gcmsg_hook( msg )
{
    sim_gcmsg( msg );
/*
    var msgps = fcscript_init( msg );
    if ( msgps[1].length == 1 &&
         msgps[1][0] == "clrset" &&
         my_user != msgps[0][0] )
    {
        if ( msgps[0][0].indexOf( 'b' ) > 0 )
        {   curcolor = 'b'; while( curcolor == 'b' ) fmind( curcolor );   }
        else if ( msgps[0][0].indexOf( 'w' ) > 0 )
        {   curcolor = 'r'; while( curcolor == 'r' ) fmind( curcolor );   }
    }
*/  initmatrix( g_row, g_col, matrix );
}

function fcscript_init( script )
{
    var last = 0;
    for ( var i=0; i<script.length; i++ )
        if ( script.charAt(i) == ';' ) last ++;
    var sarray = new Array(last);
    last = 0;
    var parray = 0;
    for ( var i=0; i<script.length; i++ )
        if ( script.charAt(i) == ';' ) {
            var cmds = script.substring( last, i )+',';
            var cmdlast = 0;
            for ( var j=0; j<cmds.length; j++ )
                if ( cmds.charAt(j) == ',' ) cmdlast ++;
            // create the ln array.
            sarray[parray] = new Array(cmdlast);
            cmdlast = 0;
            var pcmd = 0;
            for ( var j=0; j<cmds.length; j++ )
                if ( cmds.charAt(j) == ',' ) {
                    sarray[parray][pcmd] = cmds.substring( cmdlast, j );
                    cmdlast = j + 1;
                    pcmd ++;
                }
            last = i+1;
            parray ++;
        }
    return sarray;
}

function resetAppkeyToselfdef( reseter )
{
    my_appkey = reseter;
}