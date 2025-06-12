import path from 'node:path';
import { homedir } from 'node:os';
import { log, makeInput, makeList, getLatestVersion, request, printErrorLog } from '@imooc.com/utils';
import fs from 'node:fs';

const ADD_TYPE_PROJECT = 'project';
const ADD_TYPE_PAGE = 'page';
const ADD_TYPE = [
  {
    name: '项目',
    value: ADD_TYPE_PROJECT,
  },
  {
    name: '页面',
    value: ADD_TYPE_PAGE,
  },
];
const TEMP_HOME = '.cli-imooc';

// 本地模板定义
const LOCAL_TEMPLATES = [
  {
    name: 'React模板',
    value: 'react',
    npmName: '@imooc.com/react',
    version: '1.0.0',
    team: '前端开发',
  },
  {
    name: 'Vue模板',
    value: 'vue',
    npmName: '@imooc.com/vue',
    version: '1.0.0',
    team: '前端开发',
  },
  {
    name: 'Vue Element Admin模板',
    value: 'vue-element-admin',
    npmName: '@imooc.com/vue-element-admin',
    version: '1.0.0',
    team: '前端开发',
  },
];

// 获取创建类型
function getAddType() {
  return makeList({
    choices: ADD_TYPE,
    message: '请选择初始化类型',
    defaultValue: ADD_TYPE_PROJECT,
  });
}

// 获取项目名称
function getAddName() {
  return makeInput({
    message: '请输入项目名称',
    defaultValue: '',
    validate(v) {
      if (v.length > 0) {
        return true;
      }
      return '项目名称必须输入';
    },
  });
}

// 选择项目模板
function getAddTemplate(ADD_TEMPLATE) {
  return makeList({
    choices: ADD_TEMPLATE,
    message: '请选择项目模板',
  });
}

// 选择所在团队
function getAddTeam(team) {
  return makeList({
    choices: team.map(item => ({ name: item, value: item })),
    message: '请选择团队',
  })
}

// 安装缓存目录
function makeTargetPath() {
  return path.resolve(`${homedir()}/${TEMP_HOME}`, 'addTemplate');
}

// 通过API获取项目模板
async function getTemplateFromAPI() {
  try {
    const data = await request({
      url: '/v1/project',
      method: 'get',
    });
    log.verbose('template', data);
    return data;
  } catch (e) {
    printErrorLog(e);
    log.info('API获取模板失败，使用本地模板');
    return null;
  }
}

// 检查本地模板目录是否存在
function checkLocalTemplates() {
  try {
    // 获取cli-imooc-template目录中的模板
    const templateDir = path.resolve(process.cwd(), '..', 'cli-imooc-template');
    if (!fs.existsSync(templateDir)) {
      log.verbose('本地模板目录不存在:', templateDir);
      return false;
    }
    
    // 检查各个模板是否存在
    const hasReactTemplate = fs.existsSync(path.join(templateDir, 'react-template'));
    const hasVueTemplate = fs.existsSync(path.join(templateDir, 'vue-template'));
    const hasVueElementTemplate = fs.existsSync(path.join(templateDir, 'vue-element-admin-template'));
    
    log.verbose('本地模板目录检查结果:', { 
      hasReactTemplate, 
      hasVueTemplate, 
      hasVueElementTemplate 
    });
    
    return hasReactTemplate || hasVueTemplate || hasVueElementTemplate;
  } catch (e) {
    log.error('检查本地模板出错:', e.message);
    return false;
  }
}

export default async function createTemplate(name, opts) {
  let ADD_TEMPLATE = await getTemplateFromAPI();
  
  // 如果API获取失败，检查并使用本地模板
  if (!ADD_TEMPLATE) {
    const hasLocalTemplates = checkLocalTemplates();
    if (hasLocalTemplates) {
      ADD_TEMPLATE = LOCAL_TEMPLATES;
      log.success('使用本地模板');
    } else {
      throw new Error('项目模板不存在！请确保本地模板目录cli-imooc-template存在且包含模板文件。');
    }
  }
  
  const { type = null, template = null } = opts;
  let addType; // 创建项目类型
  let addName; // 项目名称
  let selectedTemplate; // 项目模板
  if (type) {
    addType = type;
  } else {
    addType = await getAddType();
  }
  log.verbose('addType', addType);
  if (addType === ADD_TYPE_PROJECT) {
    if (name) {
      addName = name;
    } else {
      addName = await getAddName();
    }
    log.verbose('addName', addName);
    if (template) {
      selectedTemplate = ADD_TEMPLATE.find(tp => tp.value === template);
      if (!selectedTemplate) {
        throw new Error(`项目模板 ${template} 不存在！`);
      }
    } else {
      // 获取团队信息
      let teamList = ADD_TEMPLATE.map(_ => _.team);
      teamList = [...new Set(teamList)];
      const addTeam = await getAddTeam(teamList);
      log.verbose('addTeam', addTeam);
      const addTemplate = await getAddTemplate(ADD_TEMPLATE.filter(_ => _.team === addTeam));
      selectedTemplate = ADD_TEMPLATE.find(_ => _.value === addTemplate);
      log.verbose('addTemplate', addTemplate);
    }
    log.verbose('selectedTemplate', selectedTemplate);
    
    // 使用固定版本号，避免远程获取
    selectedTemplate.version = selectedTemplate.version || '1.0.0';
    log.verbose('version', selectedTemplate.version);
    
    const targetPath = makeTargetPath();
    return {
      type: addType,
      name: addName,
      template: selectedTemplate,
      targetPath,
    };
  } else {
    throw new Error(`创建的项目类型 ${addType} 不支持`);
  }
}
