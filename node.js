const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs/promises");

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://www.nike.com/in/");

    await page.click(".pre-search-btn.ripple");
    await page.type("#VisualSearchInput", "t-shirt");
    await page.keyboard.press("Enter");

    await page.waitForTimeout(5000);

    const pageContent = await page.content();
    const $ = cheerio.load(pageContent);
    const productData = $(".product-grid__items .product-card").map((index, el) => {
      const name = $(".product-card__title", el).text();
      const des = $(".product-card__subtitle", el).text();
      const image = $(el).find("img").attr("src");
      const price = $(".product-price.in__styling.is--current-price.css-11s12ax", el).text();

      return {
        name: name,
        price: price,
        des: des,
        image: image,
      };
    }).get();

    await browser.close();

    console.log(productData);
    await fs.writeFile("products.json", JSON.stringify(productData, null, 4), "utf-8");
  } catch (error) {
    console.error("Error:", error);
  }
})();
