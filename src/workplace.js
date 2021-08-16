const optsScrapper = require('./select-scraper');
module.exports = async (page) => {
  return optsScrapper(page, '#applicant-work_org_id');
}