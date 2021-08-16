module.exports = async (page) => {
  const loginEmailId = 'loginform-email'
  const loginPasswordId = 'loginform-password'
  const url = 'http://iasd.interranetworks.com/app/inec-iasd/applicant/auth'
  await page.goto(url, { waitUntil: 'networkidle2' })
  
  await page.waitForSelector(`#${loginEmailId}`)
  await page.waitForSelector(`#${loginPasswordId}`)
  await page.type(`#${loginEmailId}`, 'verygreenboi@icloud.com')
  await page.type(`#${loginPasswordId}`, 'papapapa')

  await page.click('.col-md-6 button[type="submit"]')
}