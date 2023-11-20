const axios = require('axios');
const cheerio = require('cheerio');
const {writeFileSync, existsSync, readFileSync} = require('fs');

const baseUrl = 'https://www.vgchartz.com/games/games.php?page=';
const queryParams = '&name=&keyword=&console=&region=All&developer=&publisher=&goty_year=&genre=&boxart=Both&banner=Both&ownership=Both&showmultiplat=No&results=50&order=Sales&showtotalsales=0&showtotalsales=1&showpublisher=0&showpublisher=1&showvgchartzscore=0&showvgchartzscore=1&shownasales=0&shownasales=1&showdeveloper=0&showdeveloper=1&showcriticscore=0&showcriticscore=1&showpalsales=0&showpalsales=1&showreleasedate=0&showreleasedate=1&showuserscore=0&showuserscore=1&showjapansales=0&showjapansales=1&showlastupdate=0&showlastupdate=1&showothersales=0&showothersales=1&showshipped=0&showshipped=1';
const csvFilePath = 'output.csv';
// const totalPages = 2;
const totalPages = 1271;

const fetchDataForPage = async (page) => {
    try {
        const response = await axios.get(`${baseUrl}${page}${queryParams}`);
        const $ = cheerio.load(response.data);
        const dataRows = [];

        $('tr').each((index, element) => {
            const $row = $(element);
            const styleAttribute = $row.attr('style');

            if (styleAttribute) {
                const rank = $row.find('td:nth-child(1)').text();
                const imageUrl = $row.find('td:nth-child(2) img').attr('src');
                const gameLink = $row.find('td:nth-child(3) a').attr('href');
                const gameTitle = $row.find('td:nth-child(3) a').text();
                const platform = $row.find('td:nth-child(4) img').attr('alt');
                const Publisher = $row.find('td:nth-child(5)').text();
                const developer = $row.find('td:nth-child(6)').text();
                const VGChartzScore = $row.find('td:nth-child(7)').text();
                const CriticScore = $row.find('td:nth-child(8)').text();
                const UserScore = $row.find('td:nth-child(9)').text();
                const TotalShipped = $row.find('td:nth-child(10)').text();
                const TotalSales = $row.find('td:nth-child(11)').text();
                const NASales = $row.find('td:nth-child(12)').text();
                const PALSales = $row.find('td:nth-child(13)').text();
                const JapanSales = $row.find('td:nth-child(14)').text();
                const OtherSales = $row.find('td:nth-child(15)').text();
                const ReleaseDate = $row.find('td:nth-child(16)').text();
                const LastUpdate = $row.find('td:nth-child(17)').text();

                dataRows.push([
                    rank, imageUrl, gameLink, gameTitle, platform,
                    Publisher, developer, VGChartzScore, CriticScore,
                    UserScore, TotalShipped, TotalSales, NASales,
                    PALSales, JapanSales, OtherSales, ReleaseDate, LastUpdate
                ]);
            }
        });

        return dataRows;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
};

const fetchAllPages = async () => {
    for (let page = 1; page <= totalPages; page++) {
        console.log(page);
        const dataRows = await fetchDataForPage(page);
        appendToFile(dataRows)
    }
};

fetchAllPages().then(() => {
    console.log("done 😀")
})

function appendToFile(dataRows) {
    const csvContent = dataRows.map(row => row.join(',')).join('\n');
    let existingCsvContent = 'rank, imageUrl, gameLink, gameTitle, platform,Publisher, developer, VGChartzScore, CriticScore,UserScore, TotalShipped, TotalSales, NASales,PALSales, JapanSales, OtherSales, ReleaseDate, LastUpdate\n';
    if (existsSync(csvFilePath)) {
        existingCsvContent = readFileSync(csvFilePath, 'utf-8');
    }
    const combinedCsvContent = existingCsvContent + "\n" + csvContent
    writeFileSync(csvFilePath, combinedCsvContent);
    console.log(`appended data to ${csvFilePath}`);
}