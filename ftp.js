/* eslint-disable */
const Client = require('ssh2-sftp-client')
const path = require('path');
const fs = require('fs');
const moment = require('moment') // 由于我的项目中使用了moment，就直接使用了。建议换成dayjs
const archiver = require('archiver');

// sfp配置
const config = {
  host: '192.168.32.207',
  port: '22',
  username: 'root',
  password: 'shsnc!@#'
}

// 对应每个产品线的名称
const filename = 'shuiye'
// 开发环境的部署域名
const devHost = '192.168.32.206'


const sftp = new Client()
console.log('正在上传文件到服务器，请稍等');

const productStream = async ()=>{
  const createTime = moment().format('YYYYMMDD')
  const outName = `front-${filename}-${createTime}.zip`
  const remote = `/home/package/${filename}/${createTime}`;
  const file = path.join(__dirname,outName)

  try{
    const output = fs.createWriteStream(`${__dirname}/${outName}`); // zip输出的位置
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });
    archive.pipe(output);
    archive.directory('dist/', false);
    await archive.finalize(); // 压缩zip成功

    await sftp.connect(config) // 连接ftp

    if ( !await sftp.exists(remote)){ // 判断文件夹是否存在
      await sftp.mkdir(remote,true) // 文件夹不存在，则创建文件夹
    }

    await sftp.fastPut(file, `${remote}/${outName}`)
    sftp.end()
    console.log('代码已上传到207服务器')
    fs.unlinkSync(file)
  }catch(err){
    console.error(err.message);
    sftp.end()
  }
}

const developStream = async ()=>{
  const remote = '/home/shsnc/snc_product/nginx/html/@project/web_workflow';
  const file = path.join(__dirname,'dist')
  try{
    await sftp.connect(config)
    await sftp.uploadDir(file, remote)
    sftp.end()
    console.log(devHost +'--桌面云部署成功')
  }catch(err){
    console.error(err.message);
    sftp.end()
  }
}


switch(process.env.FTP_TYPE){
  case 'develop':
    config.host = devHost;
    console.log('正在部署开发环境');
    developStream();
    break;
    case 'product':
      console.log('正在上传文件到207')
      productStream()
      break;
  }