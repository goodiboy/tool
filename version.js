const exec = require('child_process').execSync
const fs = require('fs');


const getDate = (date)=> {
    let d
    if (!date){
        d = new Date()
    }else if (typeof date === 'string'){
        d = new Date(date)
    }else {
        d = date
    }
    return `${d.getFullYear()}-${d.getMonth()+ 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}` 
}

const build_author = exec('git config user.name',{encoding: 'utf-8'}).trim()
// 最后一次提交的ID
const commit_id = exec('git show -s --format=%h',{encoding: 'utf-8'}).trim()
// 最后一次提交的日期
const commit_date = getDate(exec('git show -s --format=%ad',{encoding: 'utf-8'}).trim())
// 提交的信息
const commit_msg = exec('git show -s --format=%s',{encoding: 'utf-8'}).trim()
// 获取当前的分支
// const commit_branch  = exec('git branch --show-current',{encoding: 'utf-8'}).trim()
const commit_branch  = exec('git status -b',{encoding: 'utf-8'}).trim().split('\n')[0]
// 项目名称
const project_name = 'web_workflow'

const text = `打包人员：${build_author} ---- 打包的时间：${getDate()} ----- 打包的分支：${commit_branch} ----- 最后一次提交的ID：${commit_id} ----- 最后一次提交的日期：${commit_date} ----- 提交的信息：${commit_msg}`


fs.writeFileSync(`${project_name}.tag`,text,'utf8')
