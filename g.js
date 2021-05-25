/*
 * @Author: czy0729
 * @Date: 2021-05-19 09:43:28
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-05-24 15:36:57
 */
const cheerioRN = require("cheerio-without-node-native");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;
axios.defaults.timeout = 9000;

const desc = `

  `.replace(/\n| /g, "");

(async function () {
  let [a, b] = process.argv.splice(2);
  let [url, id] = a.includes("bgm.tv") ? [b, a] : [a, b];

  id = parseInt(id.replace("https://bgm.tv/subject/", ""));

  let name_cn, name, air_date, dev;

  const data = await fetch(
    `https://api.bgm.tv/subject/${id}?responseGroup=large`
  );
  name_cn = data.name_cn || data.name || "";
  name = data.name || data.name_cn || "";
  air_date = data.air_date || "20--";
  if (data.staff && data.staff.length) {
    dev = data.staff[0].name || "";
  }

  const jsonDir = `./_raw/${Math.floor(id / 100)}/${id}.json`;
  const jsonDirPath = path.dirname(jsonDir);
  if (!fs.existsSync(jsonDirPath)) {
    fs.mkdirSync(jsonDirPath);
  }

  fs.writeFileSync(
    jsonDir,
    JSON.stringify(
      {
        id,
        title: name_cn,
        sub: name,
        length: 0,
        platform: [{ label: "PC", cn: false }],
        date: air_date,
        tags: ["ADV", "GALGAME"],
        desc,
        dev: [dev],
        pub: [dev],
      },
      null,
      2
    )
  );
  exec(`open ${jsonDir}`);

  let imgDirPath = `./_preview/${Math.floor(id / 100)}`;
  if (!fs.existsSync(imgDirPath)) {
    fs.mkdirSync(imgDirPath);
  }

  imgDirPath = `./_preview/${Math.floor(id / 100)}/${id}`;
  if (!fs.existsSync(imgDirPath)) {
    fs.mkdirSync(imgDirPath);
  }

  const imgs = [];
  const html = await fetch(url);
  const $ = cheerio(html);

  if (url.includes("bilibili.com")) {
    const banner = html.match(/banner_url: "(.+?)",/);
    if (banner) {
      imgs.push(banner[1]);
    }
    $(".article-holder img").each((index, element) => {
      const $row = cheerio(element);
      imgs.push(`https:${$row.attr("data-src")}`);
    });
  } else if (url.includes("vndb.org")) {
    $(".scr .scrlnk").each((index, element) => {
      const $row = cheerio(element);
      imgs.push($row.attr("href"));
    });
  }

  if (imgs.length) {
    exec(`open ${imgDirPath}`);
    for (let i = 0; i < imgs.length; i += 1) {
      const url = imgs[i];
      const savePath = `${imgDirPath}/_${i}.jpg`;
      if (!fs.existsSync(savePath)) {
        await download(url, savePath);
      }
    }
  }
})();

async function fetch(url) {
  const { data } = await axios({
    url,
  });
  return data;
}

function cheerio(target) {
  if (typeof target === "string") {
    return cheerioRN.load(target);
  }
  return cheerioRN(target);
}

async function download(url, pathData) {
  return new Promise(async (resolve, reject) => {
    const writer = fs.createWriteStream(pathData);

    // https://i0.hdslb.com/bfs/article/cdc49de4d04f21cd6957c5a4ffad5b50b0d88547.jpg@1320w_742h.webp
    const isBilibili = url.includes("hdslb.com");
    const response = await axios({
      url: isBilibili ? `${url}@1320w_742h.webp` : url,
      method: "GET",
      responseType: "stream",
      headers: {
        referer: isBilibili ? "http://www.bilibili.com/" : "https://vndb.org/",
      },
    });

    response.data.pipe(writer);
    writer.on("finish", () => {
      console.log(url);
      resolve();
    });
  });
}
