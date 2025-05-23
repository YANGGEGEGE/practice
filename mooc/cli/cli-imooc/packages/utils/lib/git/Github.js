import axios from 'axios';
import { GitServer } from './GitServer.js';
import log from '../log.js';

const BASE_URL = 'https://api.github.com';

class Github extends GitServer {
  constructor() {
    super();
    this.service = axios.create({
      baseURL: BASE_URL,
      timeout: 5000,
    });
    this.service.interceptors.request.use(
      config => {
        config.headers['Authorization'] = `Bearer ${this.token}`;
        config.headers['Accept'] = 'application/vnd.github+json';
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );
    this.service.interceptors.response.use(
      response => {
        return response.data;
      },
      error => {
        return Promise.reject(error);
      },
    )
  }

  get(url, params, headers) {
    return this.service({
      url,
      params,
      method: 'get',
      headers,
    });
  }

  post(url, data, headers) {
    return this.service({
      url,
      data,
      params: {
        access_token: this.token,
      },
      method: 'post',
      headers,
    });
  }

  searchRepositories(params) {
    return this.get('/search/repositories', params);
  }

  searchCode(params) {
    return this.get('/search/code', params);
  }

  getTags(fullName, params) {
    return this.get(`/repos/${fullName}/tags`, params);
  }

  getRepoUrl(fullName) {
    // return `https://github.com/${fullName}.git`;
    return `git@github.com:${fullName}.git`; // 采用SSH模式
  }

  getUser() {
    return this.get('/user');
  }

  getOrg() {
    return this.get('/user/orgs');
  }

  getRepo(owner, repo) {
    return this.get(`/repos/${owner}/${repo}`, {}, {
      accept: 'application/vnd.github+json',
    }).catch(err => {
      return null;
    });
  }

  async createRepo(name) {
    const repo = await this.getRepo(this.login, name);
    if (!repo) {
      log.info('仓库不存在，开始创建');
      if (this.own === 'user') {
        return this.post('/user/repos', { name }, {
          accept: 'application/vnd.github+json',
        });
      } else if (this.own === 'org') {
        const url = 'orgs/' + this.login + '/repos';
        return this.post(url, { name }, {
          accept: 'application/vnd.github+json',
        });
      }
    } else {
      log.info('仓库存在，直接返回');
      return repo;
    }
  }
}

export default Github;
