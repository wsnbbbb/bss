var http = require('http');//引入http模块
var fs = require('fs');
var documentRoot = 'E:/boss/bss-admin/dist';
//开启服务，监听8888端口
//端口号最好为6000以上
var server = http.createServer(function(req,res){
    /*
        req用来接受客户端数据
        res用来向客户端发送服务器数据
    */
 var url = req.url;
 var file = documentRoot + url; 
 fs.readFile(file,function(err,data){
   console.log(file)
   if(err){
    // res.writeHeader(404,{
    //   'content-type' : 'text/html;charset="utf-8"'
    // });
    // res.write('<h1>404错误</h1><p>你要找的页面不存在</p>'+file);
    fs.readFile(documentRoot+'/index.html',function(err,data){
      res.writeHeader(200,{
        'content-type' : 'text/html;charset="utf-8"'
      });
      res.write(data);//将index.html显示在客户端
      res.end();
    })
   }else{
    res.writeHeader(200,{
      'content-type' : 'text/html;charset="utf-8"'
    });
    res.write(data);//将index.html显示在客户端
    res.end();
   }

 })

    // //一参是http请求状态，200连接成功
    // //连接成功后向客户端写入头信息
    // res.writeHeader(200,{
    //     'content-type' : 'text/html;charset="utf-8"'
    // });

    // res.write('这是正文部分');//显示给客户端
    // res.end();

}).listen(88);

console.log('服务器开启成功');