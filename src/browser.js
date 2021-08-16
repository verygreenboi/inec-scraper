const puppeteer = require('puppeteer')

module.exports = async () => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  return {
    browser, page
  }
};
