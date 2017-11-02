var fs = require('fs')
var ignore = require('./ignoreArr.js')
var recursive = function(src,dst){
    fs.readdir( src, function( err, paths ){
        paths.forEach(function( path ){
            var _src = src + '/' + path, _dst = dst + '/' + path, readable, writable;
            fs.stat( _src, function( err, st ){
                if( err ) throw err
                // 判断是否为文件
                if( st.isFile() ){
                    // 创建读取流
                    readable = fs.createReadStream( _src );
                    // 创建写入流
                    writable = fs.createWriteStream( _dst );   
                    // 通过管道来传输流
                    readable.pipe( writable );
                    // console.log('copy:'+_dst)
                }
                // 如果是目录则递归调用自身
                else if( st.isDirectory() ){
                    recursive(_src,_dst)
                }
            })
        })
    })
}

var copyFile = function(src,dst){
    fs.readdir( src, function( err, paths ){
        paths.forEach(function( path ){
            if(ignore.some(el=>el==path)) return
            var _src = src + '/' + path, _dst = dst + '/' + path, readable, writable;
            fs.stat( _src, function( err, st ){
                if( err ) throw err
                // 判断是否为文件
                if( st.isFile() ){
                    // 创建读取流
                    readable = fs.createReadStream( _src )
                    // 创建写入流
                    writable = fs.createWriteStream( _dst )
                    // 通过管道来传输流
                    readable.pipe( writable )
                    // console.log('copy:'+_dst)
                }
                // 如果是目录则递归调用自身
                else if( st.isDirectory() ){
                    recursive(_src,_dst)
                }
            })
        })
    })    
}

module.exports = copyFile