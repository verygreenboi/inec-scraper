const puppet = require('./browser');
const login = require('./login');
const optsScrapper = require('./select-scraper');

(async () => {
  const { page, browser } = await puppet();

  console.log('Authenticating...')
  await login(page)
  console.log('Authentication done')

  console.log('Scraping workplace')
  let workplaceOpts = await optsScrapper(page, '#applicant-work_org_id')
  workplaceOpts = workplaceOpts.filter(opt => opt.name !== 'Select your MDA');
  console.log(workplaceOpts);
  console.log('Scraping workplace done')

  console.log('Scraping identification category')
  const identityOpts = await optsScrapper(page, '#applicantidentification-identify_category')
  console.log(identityOpts);
  console.log('Scraping identification category done')
  
  console.log('Scraping qualifications')
  const qualificationOpts = await optsScrapper(page, '#applicant-highest_qualification')
  console.log(qualificationOpts);
  console.log('Scraping qualifications done')

  await page.waitForTimeout(3000)
  
  console.log('Scraping states')
  let statesOpts = await optsScrapper(page, '#applicantcontactinformation-state_residence_id')
  console.log(statesOpts);
  console.log('Scraping states done')

  const scrapeLga = async (page, state) => {
    console.log('Scraping lga for', state?.name);
    await page.select('select#applicantcontactinformation-state_residence_id', state.code)
    await page.waitForTimeout(1000);
    await page.waitForSelector('select#applicantcontactinformation-lga_residence_id')
    return optsScrapper(page, 'select#applicantcontactinformation-lga_residence_id')
  }
  
  const scrapeWard = async (page, lga) => {
    console.log('Scraping ward for', lga?.name);
    await page.select('select#applicantcontactinformation-lga_residence_id', lga.code)
    await page.waitForTimeout(1000);
    await page.waitForSelector('select#applicantcontactinformation-ward_id')
    return optsScrapper(page, 'select#applicantcontactinformation-ward_id')
  }

  const scrapeLandmark = async (page, ward) => {
    console.log('Scraping landmarks for', ward?.name);
    await page.select('select#applicantcontactinformation-ward_id', ward.code)
    await page.waitForTimeout(1000);
    await page.waitForSelector('select#applicantcontactinformation-polling_unit')
    return optsScrapper(page, 'select#applicantcontactinformation-polling_unit')
  }

  const statesObj = {}

  for (let state of statesOpts) {
    let lgas = await scrapeLga(page, state);
    lgas = lgas.filter(l => l.name !== 'Select One')
    for(let lga of lgas) {
      await page.select('select#applicantcontactinformation-lga_residence_id', lga.code)
      let wards = await scrapeWard(page, lga)
      wards = wards.filter(l => l.name !== 'Select One')
      for (let ward of wards) {
        await page.select('select#applicantcontactinformation-ward_id', ward.code)
        let landmarks = await scrapeLandmark(page, ward)
        landmarks = landmarks.filter(l => l.name !== 'Select One')

        statesObj[state.name] = {
          name: state.name,
          code: state.code,
          lgas: {
            ...statesObj[state.name]?.lgas ?? {},
            [lga.code]: {
              name: lga.name,
              code: lga.code,
              wards: {
                ...statesObj[state.name]?.lgas[lga.code]?.wards ?? {},
                [ward.code]: {
                  name: ward.name,
                  code: ward.code,
                  landmarks
                }
              }
            } 
          }
        }
      }
    }
  }

  console.log(JSON.stringify(statesObj));

  await browser.close()
})()