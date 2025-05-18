'use strict';

const { Controller } = require('egg');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = '<div style="color:red;">Test</div>';
  }
}

module.exports = HomeController;
