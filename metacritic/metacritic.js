const axios = require('axios');
const cheerio = require('cheerio');
const {writeFileSync, existsSync, readFileSync} = require('fs');

const baseUrl = 'https://www.metacritic.com/browse/game/';
const queryParams = "?page="

// const csvFilePath = 'out.csv';
// const totalPages = 2;
const totalPages = 544;

const fetchDataForPage = async (page) => {
    try {
        let query = `${baseUrl}${queryParams}${page}`

        return await axios.get(query).then(
            (response) => {
                const $ = cheerio.load(response.data);
                const dataRows = [];
                const containerSelector = '.c-finderProductCard.c-finderProductCard-game';

                $(containerSelector).each((index, element) => {
                    const $row = $(element);
                    // const title = $row.find('.c-finderProductCard_titleHeading').text().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
                    // const tag = $row.find('.c-tagList_button').text().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
                    // const num = $row.find('.c-finderProductCard_metaItem span').first().text().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
                    // const date = $row.find('.u-text-uppercase').text().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
                    const link = $row.find('a').attr('href');
                    // dataRows.push([title, tag, date, link, num])
                  fetchDataForDetailPage(link)

                });
                return dataRows;
            })
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
};

const fetchDataForDetailPage = async (page) => {
    try {
        let query = `https://www.metacritic.com${page}`
        // console.log(query);

        return await axios.get(query).then(
            (response) => {
                const $ = cheerio.load(response.data);
                const dataRows = [];
                const containerSelector = '.c-layoutDefault_page';

                const $row = $(containerSelector).first();
                const title = $row.find('.c-productHero_title div').text().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').substring(1);
                const mata = $row.find('.c-productScoreInfo_scoreNumber span').first().text().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
                const user = $row.find('.c-productScoreInfo_scoreNumber .c-siteReviewScore_user span').first().text();
                const genre = $row.find('.c-genreList_item span').text().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
                const releaseDate = $row.find('div.c-productHero_score-container.u-flexbox.u-flexbox-column.g-bg-white div.g-text-xsmall span.u-text-uppercase').text().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
                const platforms = $row.find('.c-gameDetails .c-gameDetails_listItem').text().replaceAll("\n", "|").replaceAll("          ","").replaceAll("        ","");
                // dataRows.push()
                appendToFile("metacritic.csv", [title, mata, user, genre, releaseDate, platforms])
                return dataRows;
            })
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
};
const fetchAllPages = async () => {
    for (let page = 1; page <= totalPages; page++) {
        console.log(page);
        const dataRows = await fetchDataForPage(page);
    }
};

fetchAllPages().then(() => {
    console.log("done 😀")
})

function appendToFile(fileName, csvContent) {
    csvContent =  `"${csvContent.join('","')}"`

    let existingCsvContent = '';
    if (existsSync(fileName)) {
        existingCsvContent = readFileSync(fileName, 'utf-8');
    }
    const combinedCsvContent = existingCsvContent + "\n" + csvContent
    // console.log(combinedCsvContent);
    writeFileSync(fileName, combinedCsvContent);
    console.log(`appended data to ${fileName}`);
}