module.exports = async (page, selector) => {
  await page.waitForSelector(selector)
  return page.$$eval(`${selector} > option`, opts => opts.map(option => ({name: option.textContent, code: option.value})))
}